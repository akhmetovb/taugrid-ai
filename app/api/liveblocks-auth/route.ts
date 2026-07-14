import { auth, currentUser } from "@clerk/nextjs/server";
import { getLiveblocksClient, getCursorColor } from "@/lib/liveblocks";
import { getProjectIfAccessible } from "@/lib/project-access";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { room } = await request.json();

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  const project = await getProjectIfAccessible(room, userId, email);
  if (!project) {
    return new Response("Forbidden", { status: 403 });
  }

  const liveblocks = getLiveblocksClient();

  await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] });

  const name =
    user?.fullName ?? user?.firstName ?? user?.username ?? email;
  const avatar = user?.imageUrl ?? "";
  const color = getCursorColor(userId);

  const session = liveblocks.prepareSession(userId, {
    userInfo: { name: name ?? "", avatar, color },
  });
  session.allow(room, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
