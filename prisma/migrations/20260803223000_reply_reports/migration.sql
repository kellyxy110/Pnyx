ALTER TABLE "Report" ADD COLUMN "replyId" TEXT;

ALTER TABLE "Report"
  ADD CONSTRAINT "Report_replyId_fkey"
  FOREIGN KEY ("replyId") REFERENCES "Reply"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Report_replyId_idx" ON "Report"("replyId");