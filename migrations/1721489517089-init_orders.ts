import { MigrationInterface, QueryRunner } from "typeorm";

export class InitOrders1721489517089 implements MigrationInterface {
    name = 'InitOrders1721489517089'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."user_phone_number_unique_index"`);
        await queryRunner.query(`CREATE TYPE "public"."user_tokens_reason_enum" AS ENUM('forgot_password', 'change_password')`);
        await queryRunner.query(`CREATE TABLE "user_tokens" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" bigint, "token" character varying NOT NULL, "expired_at" TIMESTAMP NOT NULL, "reason" "public"."user_tokens_reason_enum" NOT NULL, CONSTRAINT "PK_63764db9d9aaa4af33e07b2f4bf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "locations" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "location" character varying NOT NULL DEFAULT '', "address" text NOT NULL DEFAULT '', "map_url" text NOT NULL DEFAULT '', "redirect_url" text NOT NULL DEFAULT '', CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_insurances" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "price" double precision NOT NULL, CONSTRAINT "PK_77ad89ddda674938b66305fd8d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_14712b9e7470ad9bcb34957f81" ON "order_insurances" ("code") `);
        await queryRunner.query(`CREATE TYPE "public"."order_status_logs_status_enum" AS ENUM('pending', 'accepted', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "order_status_logs" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "order_id" bigint NOT NULL, "status" "public"."order_status_logs_status_enum" NOT NULL DEFAULT 'pending', "description" text, CONSTRAINT "PK_8e29911f9edfb67c6810f56ac5a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_payment_status_enum" AS ENUM('pending', 'done', 'partially paid', 'failed')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'accepted', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "invoice_number" character varying NOT NULL, "description" text, "fleet_id" bigint NOT NULL, "customer_id" bigint NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "duration" integer NOT NULL, "payment_status" "public"."orders_payment_status_enum" NOT NULL DEFAULT 'pending', "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "insurance_id" bigint, "service_price" double precision, "out_of_town_price" double precision, "additional_services" jsonb, "driver_price" double precision, "sub_total_price" double precision NOT NULL DEFAULT '0', "total_tax" double precision NOT NULL DEFAULT '0', "discount" double precision NOT NULL DEFAULT '0', "total_price" double precision NOT NULL DEFAULT '0', "payment_link" text, "payment_pdf_url" text, "external_id" character varying, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('pending', 'verified', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "fleets" ADD "price" double precision`);
        await queryRunner.query(`ALTER TABLE "fleets" ADD "location_id" bigint`);
        await queryRunner.query(`ALTER TABLE "requests" ADD "order_id" bigint`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_5c1053a84fdbe26c7388cdd1049"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_210052a4b94dfd2394b07ebde1d"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_35988fbcc37a5be91889040d98d"`);
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "driver_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "customer_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "fleet_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "start_date" TYPE TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "start_date" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_tokens" ADD CONSTRAINT "FK_9e144a67be49e5bba91195ef5de" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_status_logs" ADD CONSTRAINT "FK_994abe9a55f6bbb2b8cef54761d" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a25092f3fd858d91b8175a322db" FOREIGN KEY ("fleet_id") REFERENCES "fleets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_fe73276bb91505ebe148f067eb3" FOREIGN KEY ("insurance_id") REFERENCES "order_insurances"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fleets" ADD CONSTRAINT "FK_ae64476f3fb99e8773e79048863" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_f8ae804f0c13e6155ff4f1e30f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_5c1053a84fdbe26c7388cdd1049" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_210052a4b94dfd2394b07ebde1d" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_35988fbcc37a5be91889040d98d" FOREIGN KEY ("fleet_id") REFERENCES "fleets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION slugify(text text)
            RETURNS text AS $$
            DECLARE
                slug text;
            BEGIN
                slug := regexp_replace(lower(text), '[^a-z0-9]+', '-', 'g');
                slug := regexp_replace(slug, '^[-]+|[-]+$', '', 'g');
                RETURN lower(slug);
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`ALTER TABLE "fleets" ADD "slug" character varying`);

        // set default slug is from name + plate_number with slugify
        await queryRunner.query(`UPDATE "fleets" SET "slug" = slugify(name || '-' || plate_number)`);

        await queryRunner.query(`ALTER TABLE "fleets" ALTER COLUMN "slug" SET NOT NULL`);

        await queryRunner.query(`ALTER TABLE "fleets" ADD CONSTRAINT "UQ_61787f86863632f99a7c38d5c1d" UNIQUE ("slug")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fleets" DROP CONSTRAINT "UQ_61787f86863632f99a7c38d5c1d"`);
        await queryRunner.query(`ALTER TABLE "fleets" DROP COLUMN "slug"`);

        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_35988fbcc37a5be91889040d98d"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_210052a4b94dfd2394b07ebde1d"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_5c1053a84fdbe26c7388cdd1049"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_f8ae804f0c13e6155ff4f1e30f1"`);
        await queryRunner.query(`ALTER TABLE "fleets" DROP CONSTRAINT "FK_ae64476f3fb99e8773e79048863"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_fe73276bb91505ebe148f067eb3"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_a25092f3fd858d91b8175a322db"`);
        await queryRunner.query(`ALTER TABLE "order_status_logs" DROP CONSTRAINT "FK_994abe9a55f6bbb2b8cef54761d"`);
        await queryRunner.query(`ALTER TABLE "user_tokens" DROP CONSTRAINT "FK_9e144a67be49e5bba91195ef5de"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "start_date"`);
        await queryRunner.query(`ALTER TABLE "requests" ADD "start_date" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "fleet_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "customer_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "requests" ALTER COLUMN "driver_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_35988fbcc37a5be91889040d98d" FOREIGN KEY ("fleet_id") REFERENCES "fleets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_210052a4b94dfd2394b07ebde1d" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_5c1053a84fdbe26c7388cdd1049" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "order_id"`);
        await queryRunner.query(`ALTER TABLE "fleets" DROP COLUMN "location_id"`);
        await queryRunner.query(`ALTER TABLE "fleets" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."orders_payment_status_enum"`);
        await queryRunner.query(`DROP TABLE "order_status_logs"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_logs_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_14712b9e7470ad9bcb34957f81"`);
        await queryRunner.query(`DROP TABLE "order_insurances"`);
        await queryRunner.query(`DROP TABLE "locations"`);
        await queryRunner.query(`DROP TABLE "user_tokens"`);
        await queryRunner.query(`DROP TYPE "public"."user_tokens_reason_enum"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "user_phone_number_unique_index" ON "users" ("phone_number") WHERE (deleted_at IS NULL)`);
    }

}
