-- CreateTable
create table "todos" (
  "id" uuid not null default gen_random_uuid(),
  "user_id" uuid not null,
  "title" text not null,
  "is_done" boolean not null default false,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  constraint "todos_pkey" primary key ("id")
);

-- CreateIndex
create index "todos_user_id_idx" on "todos" ("user_id");
