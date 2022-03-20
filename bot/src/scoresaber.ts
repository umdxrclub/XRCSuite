import axios from "axios";

const SCORESABER_API = "https://scoresaber.com/api/"

/**
 * Schema for a full ScoreSaber player profile
 */
export interface ScoreSaberPlayerProfile {
    id: string,
    name: string,
    profilePicture: string,
    country: string,
    pp: number,
    rank: number,
    countryRank: number,
    role: string,
    badges: string,
    histories: string,
    permissions: number,
    banned: boolean,
    inactive: boolean,
    scoreStats: {
        totalScore: number,
        totalRankedScore: number,
        averageRankedAccuracy: number,
        totalPlayCount: number,
        rankedPlayCount: number,
        replaysWatched: number
    }
}

/**
 * Gets the ScoreSaber profile for a specified playerId.
 *
 * @param playerId The playerId to lookup
 * @returns The profile if found, otherwise null
 */
export async function getScoreSaberProfile(playerId: string): Promise<ScoreSaberPlayerProfile | null> {
    var response = await axios.get(SCORESABER_API + `player/${playerId}/full`);
    if (response.status == 200) {
        return response.data as ScoreSaberPlayerProfile;
    }

    return null;
}