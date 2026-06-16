// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MirrorRegistry {
    enum VerificationStatus {
        Pending,
        Verified,
        Inconsistent,
        MissingEvidence
    }

    struct DecisionTrace {
        address creator;
        bytes32 decisionHash;
        string traceURI;
        bytes32 traceRoot;
        uint256 createdAt;
        VerificationStatus status;
    }

    struct CourtVerdict {
        uint256 traceIdA;
        uint256 traceIdB;
        string verdictURI;
        bytes32 verdictRoot;
        uint256 winningTraceId;
        uint256 createdAt;
    }

    uint256 public traceCount;
    uint256 public verdictCount;

    mapping(uint256 => DecisionTrace) private decisionTraces;
    mapping(uint256 => CourtVerdict) private courtVerdicts;

    event DecisionTraceRegistered(
        uint256 indexed traceId,
        address indexed creator,
        bytes32 decisionHash,
        string traceURI
    );
    event VerificationStatusUpdated(uint256 indexed traceId, VerificationStatus status);
    event CourtVerdictRegistered(
        uint256 indexed verdictId,
        uint256 indexed traceIdA,
        uint256 indexed traceIdB,
        uint256 winningTraceId
    );

    error EmptyTraceURI();
    error EmptyVerdictURI();
    error InvalidDecisionHash();
    error InvalidTraceId(uint256 traceId);
    error InvalidWinningTrace(uint256 winningTraceId);

    function registerDecisionTrace(
        bytes32 decisionHash,
        string calldata traceURI,
        bytes32 traceRoot
    ) external returns (uint256 traceId) {
        if (decisionHash == bytes32(0)) revert InvalidDecisionHash();
        if (bytes(traceURI).length == 0) revert EmptyTraceURI();

        traceId = ++traceCount;
        decisionTraces[traceId] = DecisionTrace({
            creator: msg.sender,
            decisionHash: decisionHash,
            traceURI: traceURI,
            traceRoot: traceRoot,
            createdAt: block.timestamp,
            status: VerificationStatus.Pending
        });

        emit DecisionTraceRegistered(traceId, msg.sender, decisionHash, traceURI);
    }

    function updateVerificationStatus(uint256 traceId, VerificationStatus status) external {
        _requireTrace(traceId);
        decisionTraces[traceId].status = status;

        emit VerificationStatusUpdated(traceId, status);
    }

    function registerCourtVerdict(
        uint256 traceIdA,
        uint256 traceIdB,
        string calldata verdictURI,
        bytes32 verdictRoot,
        uint256 winningTraceId
    ) external returns (uint256 verdictId) {
        _requireTrace(traceIdA);
        _requireTrace(traceIdB);
        if (bytes(verdictURI).length == 0) revert EmptyVerdictURI();
        if (winningTraceId != traceIdA && winningTraceId != traceIdB) {
            revert InvalidWinningTrace(winningTraceId);
        }

        verdictId = ++verdictCount;
        courtVerdicts[verdictId] = CourtVerdict({
            traceIdA: traceIdA,
            traceIdB: traceIdB,
            verdictURI: verdictURI,
            verdictRoot: verdictRoot,
            winningTraceId: winningTraceId,
            createdAt: block.timestamp
        });

        emit CourtVerdictRegistered(verdictId, traceIdA, traceIdB, winningTraceId);
    }

    function getDecisionTrace(uint256 traceId)
        external
        view
        returns (
            address creator,
            bytes32 decisionHash,
            string memory traceURI,
            bytes32 traceRoot,
            uint256 createdAt,
            VerificationStatus status
        )
    {
        _requireTrace(traceId);
        DecisionTrace storage trace = decisionTraces[traceId];
        return (
            trace.creator,
            trace.decisionHash,
            trace.traceURI,
            trace.traceRoot,
            trace.createdAt,
            trace.status
        );
    }

    function getCourtVerdict(uint256 verdictId)
        external
        view
        returns (
            uint256 traceIdA,
            uint256 traceIdB,
            string memory verdictURI,
            bytes32 verdictRoot,
            uint256 winningTraceId,
            uint256 createdAt
        )
    {
        if (verdictId == 0 || verdictId > verdictCount) revert InvalidTraceId(verdictId);
        CourtVerdict storage verdict = courtVerdicts[verdictId];
        return (
            verdict.traceIdA,
            verdict.traceIdB,
            verdict.verdictURI,
            verdict.verdictRoot,
            verdict.winningTraceId,
            verdict.createdAt
        );
    }

    function _requireTrace(uint256 traceId) internal view {
        if (traceId == 0 || traceId > traceCount) revert InvalidTraceId(traceId);
    }
}
