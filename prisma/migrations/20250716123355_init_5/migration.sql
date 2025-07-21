/*
  Warnings:

  - You are about to drop the column `group_id` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the `group` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "group" DROP CONSTRAINT "Chats_user_Id_fkey";

-- DropForeignKey
ALTER TABLE "groupMembers" DROP CONSTRAINT "groupMembers_group_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_group_id_fkey";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "group_id";

-- DropTable
DROP TABLE "group";

-- CreateTable
CREATE TABLE "chat" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_Id" UUID NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "groupMembers" ADD CONSTRAINT "groupMembers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "Chats_user_Id_fkey" FOREIGN KEY ("user_Id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
