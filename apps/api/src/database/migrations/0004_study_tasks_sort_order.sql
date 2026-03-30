DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'study_tasks' AND column_name = 'sort_order') THEN
    ALTER TABLE "study_tasks" ADD COLUMN "sort_order" integer;
  END IF;
END $$;
