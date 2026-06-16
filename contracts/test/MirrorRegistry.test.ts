import { expect } from "chai";
import { ethers } from "hardhat";

describe("MirrorRegistry", function () {
  async function deployRegistry() {
    const [creator] = await ethers.getSigners();
    const MirrorRegistry = await ethers.getContractFactory("MirrorRegistry");
    const registry = await MirrorRegistry.deploy();
    return { registry, creator };
  }

  it("registers a decision trace", async function () {
    const { registry, creator } = await deployRegistry();
    const decisionHash = ethers.keccak256(ethers.toUtf8Bytes("decision"));
    const traceRoot = ethers.keccak256(ethers.toUtf8Bytes("trace"));

    await expect(registry.registerDecisionTrace(decisionHash, "0g://trace-root", traceRoot))
      .to.emit(registry, "DecisionTraceRegistered")
      .withArgs(1, creator.address, decisionHash, "0g://trace-root");

    const trace = await registry.getDecisionTrace(1);
    expect(trace.creator).to.equal(creator.address);
    expect(trace.decisionHash).to.equal(decisionHash);
    expect(trace.traceURI).to.equal("0g://trace-root");
    expect(trace.traceRoot).to.equal(traceRoot);
    expect(trace.status).to.equal(0);
  });

  it("updates verification status", async function () {
    const { registry } = await deployRegistry();
    const decisionHash = ethers.keccak256(ethers.toUtf8Bytes("decision"));
    const traceRoot = ethers.keccak256(ethers.toUtf8Bytes("trace"));

    await registry.registerDecisionTrace(decisionHash, "0g://trace-root", traceRoot);

    await expect(registry.updateVerificationStatus(1, 1))
      .to.emit(registry, "VerificationStatusUpdated")
      .withArgs(1, 1);

    const trace = await registry.getDecisionTrace(1);
    expect(trace.status).to.equal(1);
  });

  it("registers a court verdict", async function () {
    const { registry } = await deployRegistry();
    const rootA = ethers.keccak256(ethers.toUtf8Bytes("trace-a"));
    const rootB = ethers.keccak256(ethers.toUtf8Bytes("trace-b"));
    const verdictRoot = ethers.keccak256(ethers.toUtf8Bytes("verdict"));

    await registry.registerDecisionTrace(rootA, "0g://trace-a", rootA);
    await registry.registerDecisionTrace(rootB, "0g://trace-b", rootB);

    await expect(registry.registerCourtVerdict(1, 2, "0g://verdict", verdictRoot, 1))
      .to.emit(registry, "CourtVerdictRegistered")
      .withArgs(1, 1, 2, 1);

    const verdict = await registry.getCourtVerdict(1);
    expect(verdict.traceIdA).to.equal(1);
    expect(verdict.traceIdB).to.equal(2);
    expect(verdict.verdictURI).to.equal("0g://verdict");
    expect(verdict.verdictRoot).to.equal(verdictRoot);
    expect(verdict.winningTraceId).to.equal(1);
  });

  it("reads stored data for multiple traces", async function () {
    const { registry } = await deployRegistry();
    const hashA = ethers.keccak256(ethers.toUtf8Bytes("a"));
    const hashB = ethers.keccak256(ethers.toUtf8Bytes("b"));

    await registry.registerDecisionTrace(hashA, "0g://a", hashA);
    await registry.registerDecisionTrace(hashB, "0g://b", hashB);

    const traceA = await registry.getDecisionTrace(1);
    const traceB = await registry.getDecisionTrace(2);

    expect(traceA.decisionHash).to.equal(hashA);
    expect(traceB.decisionHash).to.equal(hashB);
    expect(await registry.traceCount()).to.equal(2);
  });

  it("rejects invalid trace IDs", async function () {
    const { registry } = await deployRegistry();
    await expect(registry.getDecisionTrace(1))
      .to.be.revertedWithCustomError(registry, "InvalidTraceId")
      .withArgs(1);

    await expect(registry.updateVerificationStatus(99, 1))
      .to.be.revertedWithCustomError(registry, "InvalidTraceId")
      .withArgs(99);

    const hash = ethers.keccak256(ethers.toUtf8Bytes("decision"));
    await registry.registerDecisionTrace(hash, "0g://trace", hash);

    await expect(registry.registerCourtVerdict(1, 99, "0g://verdict", hash, 1))
      .to.be.revertedWithCustomError(registry, "InvalidTraceId")
      .withArgs(99);
  });
});
