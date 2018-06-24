// @flow

import assert from "assert";
import backboard from "backboard";
import { after, before, describe, it } from "mocha";
import testHelpers from "../../../test/helpers";
import { connectMeta, idb } from "../../db";
import { g, local } from "../../util";
import league from "./index";

describe("worker/core/league/create", () => {
    before(async () => {
        idb.meta = await connectMeta({});
        await league.create("Test", 0, undefined, 2013, false, 0, {});
    });

    after(async () => {
        await league.remove(g.lid);

        if (idb.meta !== undefined) {
            idb.meta.close();
        }
        await backboard.delete("meta");
        idb.meta = undefined;
    });

    it("add entry in meta leagues object store", async () => {
        const l = await idb.meta.leagues.get(g.lid);
        assert.equal(l.name, "Test");
        assert.equal(l.tid, 0);
        assert.equal(local.phaseText, `${g.startingSeason} preseason`);
        assert.equal(local.statusText, "Idle");
    });

    it("create all necessary object stores", () => {
        assert.equal(idb.league.objectStoreNames.length, 17);
        assert.equal(idb.league.objectStoreNames.contains("awards"), true);
        assert.equal(idb.league.objectStoreNames.contains("events"), true);
        assert.equal(
            idb.league.objectStoreNames.contains("draftLotteryResults"),
            true,
        );
        assert.equal(
            idb.league.objectStoreNames.contains("gameAttributes"),
            true,
        );
        assert.equal(idb.league.objectStoreNames.contains("games"), true);
        assert.equal(idb.league.objectStoreNames.contains("messages"), true);
        assert.equal(
            idb.league.objectStoreNames.contains("negotiations"),
            true,
        );
        assert.equal(idb.league.objectStoreNames.contains("players"), true);
        assert.equal(idb.league.objectStoreNames.contains("playerFeats"), true);
        assert.equal(
            idb.league.objectStoreNames.contains("playoffSeries"),
            true,
        );
        assert.equal(
            idb.league.objectStoreNames.contains("releasedPlayers"),
            true,
        );
        assert.equal(idb.league.objectStoreNames.contains("schedule"), true);
        assert.equal(idb.league.objectStoreNames.contains("teams"), true);
        assert.equal(idb.league.objectStoreNames.contains("teamSeasons"), true);
        assert.equal(idb.league.objectStoreNames.contains("teamStats"), true);
        assert.equal(idb.league.objectStoreNames.contains("trade"), true);
    });

    it("initialize gameAttributes object store", async () => {
        const gameAttributes = await idb.league.gameAttributes.getAll();
        const gTest = gameAttributes.reduce((obj, row) => {
            obj[row.key] = row.value;
            return obj;
        }, {});

        assert.equal(gTest.leagueName, "Test");
        assert.equal(gTest.phase, 0);
        assert.equal(gTest.season, gTest.startingSeason);
        assert.equal(gTest.userTid, 0);
        assert.equal(gTest.gameOver, false);
        assert.equal(gTest.daysLeft, 0);
        assert.equal(gTest.showFirstOwnerMessage, true);

        assert.equal(Object.keys(gTest).length, 41);
    });

    it("initialize teams object store", async () => {
        const teams = await idb.league.teams.getAll();

        const cids = teams.map(t => t.cid);
        const dids = teams.map(t => t.did);

        assert.equal(teams.length, g.numTeams);
        for (let i = 0; i < 2; i++) {
            assert.equal(testHelpers.numInArrayEqualTo(cids, i), 15);
        }
        for (let i = 0; i < 6; i++) {
            assert.equal(testHelpers.numInArrayEqualTo(dids, i), 5);
        }
        for (let i = 0; i < g.numTeams; i++) {
            assert.equal(typeof teams[i].name, "string");
            assert.equal(typeof teams[i].region, "string");
            assert.equal(typeof teams[i].tid, "number");
        }
    });

    it("initialize teamSeasons object store", async () => {
        const teamSeasons = await idb.league.teamSeasons.getAll();
        assert.equal(teamSeasons.length, g.numTeams);
    });

    it("initialize teamStats object store", async () => {
        const teamStats = await idb.league.teamStats.getAll();
        assert.equal(teamStats.length, g.numTeams);
    });

    it("initialize trade object store", async () => {
        const tr = await idb.league.trade.getAll();
        assert.equal(tr.length, 1);
        assert.equal(tr[0].rid, 0);
        assert.equal(tr[0].teams.length, 2);
    });

    it("initialize players object store", async () => {
        const players = await idb.league.players.getAll();
        assert.equal(players.length, 30 * 13 + 150 + 70 * 3);
    });
});
