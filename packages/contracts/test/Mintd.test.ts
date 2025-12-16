import { expect } from "chai";
import hre from "hardhat";

const { ethers, networkHelpers } = await hre.network.connect();

describe("Mintd Contract", function () {
  let mintd: any;
  let owner: any;
  let admin: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    // used to run / setup things you want set before each test
    [owner, admin, user1, user2] = await ethers.getSigners();
    const Mintd = await ethers.getContractFactory("Mintd");
    mintd = await Mintd.deploy(owner.address);
    await mintd.waitForDeployment();

    // add admin for testing
    await mintd.connect(owner).addAdmin(admin.address);
  });

  it("_nextTokenId should return 1 initially", async function () {
    const nextTokenId = await mintd.getNextTokenId();
    expect(nextTokenId).to.equal(1);
  });

  it("should allow only owner to add admin", async function () {
    await expect(mintd.connect(owner).addAdmin(admin.address))
      .to.emit(mintd, "AdminAdded")
      .withArgs(admin.address);

    await expect(
      mintd.connect(user1).addAdmin(user2.address)
    ).to.be.revertedWithCustomError(mintd, "OwnableUnauthorizedAccount");
  });
  it("should allow only owner to remove admin", async function () {
    // first add an admin
    await mintd.connect(owner).addAdmin(admin.address);

    await expect(mintd.connect(owner).removeAdmin(admin.address))
      .to.emit(mintd, "AdminRemoved")
      .withArgs(admin.address);

    await expect(
      mintd.connect(user1).removeAdmin(user2.address)
    ).to.be.revertedWithCustomError(mintd, "OwnableUnauthorizedAccount");
  });
  it("should recognize admin addresses", async function () {
    expect(await mintd.isAdminAddress(admin.address)).to.equal(true);
    expect(await mintd.isAdminAddress(user1.address)).to.equal(false);
  });
  it("non-admin cannot call admin-only functions", async function () {
    await expect(
      mintd
        .connect(user1)
        .mint(user1.address, "ipfs://example-uri", "SN-TEST-008")
    ).to.be.revertedWith("Not admin");
  });
  it("should allow admin to mint a new NFT", async function () {
    const tx = await mintd
      .connect(admin)
      .mint(user1.address, "ipfs://example-uri", "SN-TEST-001");

    await tx.wait();

    expect(await mintd.ownerOf(1)).to.equal(user1.address);

    const metadata = await mintd.getWatchData(1);
    expect(metadata[0]).to.equal("SN-TEST-001");
  });
  it("should prevent non-admin from minting a new NFT", async function () {
    await expect(
      mintd
        .connect(user1)
        .mint(user2.address, "ipfs://example-uri", "SN-TEST-002")
    ).to.be.revertedWith("Not admin");
  });
  it("user can request transfer", async function () {
    // mint an NFT to user1
    await mintd
      .connect(admin)
      .mint(user1.address, "ipfs://example-uri", "SN-TEST-003");

    // connect as user1 and request transfer to user2
    const tx = await mintd
      .connect(user1)
      .requestTransfer(1, user2.address, "paymentRef");
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockNumber);
    await expect(tx)
      .to.emit(mintd, "TransferRequested")
      .withArgs(1, user1.address, user2.address, "paymentRef", block!.timestamp);
  });
  it("requested transfers are stored correctly", async function () {
    // mint an NFT to user1
    await mintd
      .connect(admin)
      .mint(user1.address, "ipfs://example-uri", "SN-TEST-004");

    // connect as user1 and request transfer to user2
    await mintd.connect(user1).requestTransfer(1, user2.address, "paymentRef2");

    const req = await mintd.getTransferRequest(1);
    expect(req.status).to.equal(1); // PENDING
    expect(req.from).to.equal(user1.address);
    expect(req.to).to.equal(user2.address);
    expect(req.paymentRef).to.equal("paymentRef2");
  });
  it("admin can approve transfer requests", async function () {
    // mint an NFT to user1
    await mintd
      .connect(admin)
      .mint(user1.address, "ipfs://example-uri", "SN-TEST-005");

    // connect as user1 and request transfer to user2
    const requestTx = await mintd
      .connect(user1)
      .requestTransfer(1, user2.address, "paymentRef3");

    // connect as admin and approve the transfer request
    await mintd.connect(admin).approveTransfer(1);

    const req = await mintd.getTransferRequest(1);
    expect(req.status).to.equal(2); // APPROVED
  });
  it("admin can reject transfer requests", async function () {
    // Mint NFT to user1
    await mintd
      .connect(admin)
      .mint(user1.address, "ipfs://example-uri", "SN-TEST-006");

    // User1 requests transfer to user2
    await mintd.connect(user1).requestTransfer(1, user2.address, "paymentRef4");

    // Admin rejects the transfer request
    const rejectTx = await mintd.connect(admin).rejectTransfer(1);
    const rejectReceipt = await rejectTx.wait();
    const rejectBlock = await ethers.provider.getBlock(
      rejectReceipt.blockNumber
    );

    // Validate event
    await expect(rejectTx)
      .to.emit(mintd, "TransferRejected")
      .withArgs(1, admin.address, rejectBlock!.timestamp);

    // Validate updated state
    const req = await mintd.getTransferRequest(1);
    expect(req.status).to.equal(3); // REJECTED
  });

  it("user can cancel transfer", async function () {
    // Mint NFT to user1
    await mintd
      .connect(admin)
      .mint(user1.address, "ipfs://example-uri", "SN-TEST-007");

    // User1 requests transfer
    await mintd.connect(user1).requestTransfer(1, user2.address, "paymentRef5");

    // User1 cancels transfer
    const cancelTx = await mintd.connect(user1).cancelTransfer(1);
    const cancelReceipt = await cancelTx.wait();
    const cancelBlock = await ethers.provider.getBlock(
      cancelReceipt.blockNumber
    );

    // Validate event
    await expect(cancelTx)
      .to.emit(mintd, "TransferCancelled")
      .withArgs(1, user1.address, cancelBlock!.timestamp);

    // Validate state
    const req = await mintd.getTransferRequest(1);
    expect(req.status).to.equal(4); // CANCELLED
  });
  // // must follow the request -> approve/reject/cancel flow
  it("direct transferFrom must fail if caller is not admin", async function () {
    // mint an NFT to user1
    await mintd
      .connect(admin)
      .mint(user1.address, "ipfs://example-uri", "SN-TEST-008");
    await expect(
      mintd.connect(user1).transferFrom(user1.address, user2.address, 1)
    ).to.be.revertedWith("Transfers restricted");
  });
  it("direct safeTransferFrom must fail if caller is not admin", async function () {
    // mint an NFT to user1
    await mintd
      .connect(admin)
      .mint(user1.address, "ipfs://example-uri", "SN-TEST-009");
    await expect(
      mintd
        .connect(user1)
        ["safeTransferFrom(address,address,uint256)"](
          user1.address,
          user2.address,
          1
        )
    ).to.be.revertedWith("Transfers restricted");
  });
  it("should allow transferFrom and safeTransferFrom by admin, and by owner only when transfersAllowed is enabled", async function () {
    // Mint an NFT to user1
    await mintd
      .connect(admin)
      .mint(user1.address, "ipfs://example-uri", "SN-TEST-010");

      // 1. Admin can transfer directly (bypasses request/approval flow)
      try {
        
          await expect(
            mintd.connect(admin).transferFrom(user1.address, user2.address, 1)
          ).to.not.be.revert(ethers);
          console.log("Admin transferFrom test passed");
      } catch (error: any) {
        console.error("Error during admin transferFrom test:", error.message);
      }

    // Move token back to user1 so we can test again
    await mintd.connect(admin).transferFrom(user2.address, user1.address, 1);

    //
    // 2. Admin can safeTransferFrom directly
    //
    await expect(
      mintd
        .connect(admin)
        ["safeTransferFrom(address,address,uint256)"](
          user1.address,
          user2.address,
          1
        )
    ).to.not.be.revert(ethers);

    // Move token back to user1 again
    await mintd
      .connect(admin)
      ["safeTransferFrom(address,address,uint256)"](
        user2.address,
        user1.address,
        1
      );

    //
    // 3. User1 CANNOT transfer until admin enables `_transfersAllowed`
    //
    await expect(
      mintd.connect(user1).transferFrom(user1.address, user2.address, 1)
    ).to.be.revertedWith("Transfers restricted");

    //
    // 4. Enable transfer override
    //
    await mintd.connect(admin).setTransferAllowed(1, true);

    //
    // 5. User1 can now transfer because transfersAllowed[tokenId] = true
    //
    await expect(
      mintd.connect(user1).transferFrom(user1.address, user2.address, 1)
    ).to.not.be.revert(ethers);

    // Move back again for safeTransferFrom test
    await mintd.connect(admin).transferFrom(user2.address, user1.address, 1);

    //
    // 6. User1 can safeTransferFrom when transfersAllowed[tokenId] = true
    //
    await expect(
      mintd
        .connect(user1)
        ["safeTransferFrom(address,address,uint256)"](
          user1.address,
          user2.address,
          1
        )
    ).to.not.be.revert(ethers);
  });
    it("admin can flag watch as stolen, preventing transfers", async function () {
    // Mint an NFT to user1
    await mintd
      .connect(admin)
      .mint(user1.address, "ipfs://example-uri", "SN-TEST-011");

    // Admin can flag watch as stolen, preventing transfers
    await mintd.connect(admin).adminSetStolen(1, true);
    const watch = await mintd.getWatchData(1);
    expect(watch.status).to.equal(1); // STOLEN
    await expect(mintd.connect(user1).transferFrom(user1.address, user2.address, 1)).to.be.revertedWith("Transfers restricted");
    });
    
    it("should revert approveTransfer if no pending request", async function () {

      // Mint an NFT to user1
      await mintd
        .connect(admin)
        .mint(user1.address, "ipfs://example-uri", "SN-TEST-012");

        await expect(mintd.connect(admin).approveTransfer(1)).to.be.revertedWith("No pending");
    });
    it("should not allow rejectTransfer after cancel", async function () {
      await mintd.connect(admin).mint(user1.address, "ipfs://uri", "SN-A2");

      await mintd.connect(user1).requestTransfer(1, user2.address, "PAY-1");
      await mintd.connect(user1).cancelTransfer(1);

      await expect(mintd.connect(admin).rejectTransfer(1)).to.be.revertedWith(
        "No pending"
      );
    });
    it("should prevent minting while paused", async function () {
        // pause the contract
        await mintd.connect(owner).pause();

        // attempt to mint while paused#
        await expect(
          mintd.connect(admin).mint(user1.address, "ipfs://uri", "SN-PAUSED")
        ).to.be.revertedWithCustomError(mintd, "EnforcedPause");
    });
    it("should prevent requesting transfers while paused", async function () {
        // mint an NFT to user1
        await mintd
          .connect(admin)
          .mint(user1.address, "ipfs://example-uri", "SN-TEST-013");

        // pause the contract
        await mintd.connect(owner).pause();

        // attempt to request a transfer while paused
        await expect(
          mintd.connect(user1).requestTransfer(1, user2.address, "PAY-2")
        ).to.be.revertedWithCustomError(mintd, "EnforcedPause");
    });
    it("should prevent approveTransfer while paused", async function () {
      await mintd.connect(admin).mint(user1.address, "ipfs://uri", "SN-P3");
      await mintd.connect(user1).requestTransfer(1, user2.address, "PAY-Y");
      await mintd.connect(owner).pause();

      await expect(
        mintd.connect(admin).approveTransfer(1)
      ).to.be.revertedWithCustomError(mintd, "EnforcedPause");
    });
    it("should work normally after unpausing", async function () {
      await mintd.connect(admin).mint(user1.address, "ipfs://uri", "SN-UP4");
      await mintd.connect(owner).pause();
      await mintd.connect(owner).unpause();

      await mintd.connect(user1).requestTransfer(1, user2.address, "PAY-Z");
      await mintd.connect(admin).approveTransfer(1);
    });
    it("should automatically reset transfersAllowed after approveTransfer", async function () {
      await mintd.connect(admin).mint(user1.address, "ipfs://uri", "SN-T1");
      await mintd.connect(user1).requestTransfer(1, user2.address, "PAY");

      await mintd.connect(admin).approveTransfer(1);

      const allowed = await mintd.getTransfersAllowed(1);
      expect(allowed).to.equal(false);
    });
    it("newly minted watches should not be stolen by default", async function () {
      await mintd.connect(admin).mint(user1.address, "ipfs://uri", "SN-NS1");
      const watch = await mintd.getWatchData(1);
      expect(watch.status).to.equal(0); // NOT_STOLEN
    });
    it("should not allow token owner to approve their own transfer", async function () {
        await mintd.connect(admin).mint(user1.address, "ipfs://uri", "SN-SELF1");
        await mintd.connect(user1).requestTransfer(1, user2.address, "PAY-SELF");

        await expect(
          mintd.connect(user1).approveTransfer(1)
        ).to.be.revertedWith("Not admin");
    })

});


