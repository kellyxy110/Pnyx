import type { Prisma } from "@prisma/client";

/** Read boundaries shared by HTML pages, API reads, search, and related-content lists. */
export function availablePersonWhere(viewerId?: string): Prisma.UserWhereInput {
  return {
    AND: [
      { OR: [{ suspendedUntil: null }, { suspendedUntil: { lte: new Date() } }] },
      ...(viewerId ? [{ blocksGiven: { none: { blockedId: viewerId } }, blocksReceived: { none: { blockerId: viewerId } } }] : []),
    ],
  };
}

export function readableProfileWhere(viewerId?: string): Prisma.UserWhereInput {
  return { AND: [availablePersonWhere(viewerId), { OR: [
    { profileVisibility: "PUBLIC" },
    ...(viewerId ? [{ id: viewerId }, { profileVisibility: "FOLLOWERS_ONLY" as const, followers: { some: { followerId: viewerId } } }] : []),
  ] }] };
}

export function readableSpaceWhere(viewerId?: string): Prisma.SpaceWhereInput {
  return { OR: [{ isPublic: true }, ...(viewerId ? [{ members: { some: { userId: viewerId } } }] : [])] };
}

function contentVisibility(viewerId?: string) {
  return { OR: [
    { visibility: "PUBLIC" as const },
    ...(viewerId ? [
      { visibility: "FOLLOWERS_ONLY" as const, author: { followers: { some: { followerId: viewerId } } } },
      { visibility: "SPACE_ONLY" as const, space: { members: { some: { userId: viewerId } } } },
    ] : []),
  ] };
}

export function readablePostWhere(viewerId?: string): Prisma.PostWhereInput {
  return { isDeleted: false, author: availablePersonWhere(viewerId), OR: [
    ...(viewerId ? [{ authorId: viewerId }] : []),
    { isDraft: false, AND: [{ space: readableSpaceWhere(viewerId) }, contentVisibility(viewerId)] },
  ] };
}

export function readableArtifactWhere(viewerId?: string): Prisma.ArtifactWhereInput {
  return { author: availablePersonWhere(viewerId), AND: artifactSourceWhere(viewerId), OR: [
    ...(viewerId ? [{ authorId: viewerId }, { contributors: { some: { userId: viewerId } } }] : []),
    { status: { in: ["PUBLISHED", "COMMUNITY_REVIEWED", "VERIFIED"] }, AND: [{ space: readableSpaceWhere(viewerId) }, contentVisibility(viewerId)] },
  ] };
}

/** Discovery/public profile must never advertise private content, even to its owner. */
export function publicPostWhere(viewerId?: string): Prisma.PostWhereInput {
  return { isDeleted: false, isDraft: false, visibility: "PUBLIC", space: { isPublic: true }, author: availablePersonWhere(viewerId) };
}
function artifactSourceWhere(viewerId?: string, publicOnly = false): Prisma.ArtifactWhereInput[] {
  const post = publicOnly ? publicPostWhere(viewerId) : readablePostWhere(viewerId);
  return [
    { OR: [{ sourcePost: null }, { sourcePost: post }] },
    { OR: [{ sourceReply: null }, { sourceReply: { isDeleted: false, author: availablePersonWhere(viewerId), post } }] },
  ];
}
export function publicArtifactWhere(viewerId?: string): Prisma.ArtifactWhereInput {
  return { AND: artifactSourceWhere(viewerId, true), status: { in: ["PUBLISHED", "COMMUNITY_REVIEWED", "VERIFIED"] }, visibility: "PUBLIC", space: { isPublic: true }, author: availablePersonWhere(viewerId) };
}
