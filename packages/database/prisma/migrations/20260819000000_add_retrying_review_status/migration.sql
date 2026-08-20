-- Add the retry state before later migrations write existing sessions to it.
ALTER TYPE "ReviewStatus" ADD VALUE 'RETRYING';
