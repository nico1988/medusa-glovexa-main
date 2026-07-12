import { Migration } from '@mikro-orm/migrations';

export class Migration20260712105027 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "customization_request" ("id" text not null, "mode" text check ("mode" in ('configurator', 'editor')) not null default 'configurator', "method" text check ("method" in ('logo', 'text', 'both')) not null default 'logo', "status" text check ("status" in ('draft', 'submitted', 'artwork_review', 'proof_pending', 'proof_approved', 'quoted', 'accepted', 'in_production', 'rejected')) not null default 'draft', "print_technique" text null, "positions" jsonb null, "text_content" jsonb null, "color_count" integer not null default 1, "pantone" text null, "product_id" text not null, "variant_id" text null, "customer_id" text null, "moq" integer not null default 1, "quantity" integer not null default 1, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customization_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customization_request_deleted_at" ON "customization_request" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "customization_proof" ("id" text not null, "file_id" text null, "url" text not null, "version" integer not null default 1, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "customer_comment" text null, "reviewed_by" text null, "request_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customization_proof_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customization_proof_request_id" ON "customization_proof" (request_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customization_proof_deleted_at" ON "customization_proof" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "customization_design" ("id" text not null, "template_id" text null, "name" text null, "design_document" jsonb not null, "preview_url" text null, "version" integer not null default 1, "is_current" boolean not null default true, "is_draft" boolean not null default false, "request_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customization_design_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customization_design_request_id" ON "customization_design" (request_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customization_design_deleted_at" ON "customization_design" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "customization_artwork" ("id" text not null, "file_id" text null, "url" text not null, "original_filename" text not null, "mime" text null, "width" integer null, "height" integer null, "version" integer not null default 1, "is_current" boolean not null default true, "request_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customization_artwork_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customization_artwork_request_id" ON "customization_artwork" (request_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customization_artwork_deleted_at" ON "customization_artwork" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "design_template" ("id" text not null, "product_id" text not null, "template_type" text check ("template_type" in ('flat_2d', 'dieline', 'model_3d')) not null default 'flat_2d', "name" text null, "base_asset_url" text null, "model_asset_url" text null, "print_areas" jsonb not null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "design_template_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_design_template_deleted_at" ON "design_template" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "customization_proof" add constraint "customization_proof_request_id_foreign" foreign key ("request_id") references "customization_request" ("id") on update cascade;`);

    this.addSql(`alter table if exists "customization_design" add constraint "customization_design_request_id_foreign" foreign key ("request_id") references "customization_request" ("id") on update cascade;`);

    this.addSql(`alter table if exists "customization_artwork" add constraint "customization_artwork_request_id_foreign" foreign key ("request_id") references "customization_request" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "customization_proof" drop constraint if exists "customization_proof_request_id_foreign";`);

    this.addSql(`alter table if exists "customization_design" drop constraint if exists "customization_design_request_id_foreign";`);

    this.addSql(`alter table if exists "customization_artwork" drop constraint if exists "customization_artwork_request_id_foreign";`);

    this.addSql(`drop table if exists "customization_request" cascade;`);

    this.addSql(`drop table if exists "customization_proof" cascade;`);

    this.addSql(`drop table if exists "customization_design" cascade;`);

    this.addSql(`drop table if exists "customization_artwork" cascade;`);

    this.addSql(`drop table if exists "design_template" cascade;`);
  }

}
