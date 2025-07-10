import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigrations1715430361090 implements MigrationInterface {
    name = 'InitialMigrations1715430361090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'driver', 'customer')`);
        await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "email" character varying, "phone_number" character varying, "role" "public"."users_role_enum", "gender" "public"."users_gender_enum", "date_of_birth" date, "password" character varying, "nik" character varying, "id_photo" character varying, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fleet_photos" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "fleet_id" bigint, "photo" character varying NOT NULL, CONSTRAINT "PK_80a3179d54caad518dabab9b758" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."fleets_type_enum" AS ENUM('car', 'motorcycle')`);
        await queryRunner.query(`CREATE TABLE "fleets" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "type" "public"."fleets_type_enum" NOT NULL, "color" character varying NOT NULL, "plate_number" character varying NOT NULL, CONSTRAINT "PK_18a71e919faac62c1da6b5f8754" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."requests_type_enum" AS ENUM('delivery', 'pick_up')`);
        await queryRunner.query(`CREATE TYPE "public"."requests_status_enum" AS ENUM('pending', 'on_progress', 'done')`);
        await queryRunner.query(`CREATE TABLE "requests" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "customer_id" bigint NOT NULL, "fleet_id" bigint NOT NULL, "driver_id" bigint NOT NULL, "start_date" TIMESTAMP NOT NULL, "type" "public"."requests_type_enum" NOT NULL, "status" "public"."requests_status_enum" NOT NULL DEFAULT 'pending', "is_self_pickup" boolean NOT NULL DEFAULT false, "description" text, "address" text NOT NULL, CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "request_log_photos" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "log_id" bigint, "photo" character varying NOT NULL, CONSTRAINT "PK_87d5dbdbd64b426fc0fc5473e0b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."request_logs_type_enum" AS ENUM('start', 'end')`);
        await queryRunner.query(`CREATE TABLE "request_logs" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "request_id" bigint, "type" "public"."request_logs_type_enum" NOT NULL, "description" text, CONSTRAINT "PK_1edd3815ae37a9b9511f5a26dca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification_types" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "key" character varying NOT NULL, "text" character varying NOT NULL, CONSTRAINT "UQ_58e4a26add3dbc104fc9265d5ae" UNIQUE ("key"), CONSTRAINT "PK_aa965e094494e2c4c5942cfb42d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification_objects" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "type_id" bigint NOT NULL, "request_id" bigint, CONSTRAINT "PK_d7f6213eca050e26a66e10aacbf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "notifier_id" bigint, "object_id" bigint NOT NULL, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification_views" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" bigint, "notification_id" bigint NOT NULL, CONSTRAINT "PK_4349538d25b133b87ec4bbc2e64" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "device_tokens" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" bigint NOT NULL, "token" character varying NOT NULL, CONSTRAINT "PK_84700be257607cfb1f9dc2e52c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "fleet_photos" ADD CONSTRAINT "FK_191b3faf32bc95905f6a16aff09" FOREIGN KEY ("fleet_id") REFERENCES "fleets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_210052a4b94dfd2394b07ebde1d" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_35988fbcc37a5be91889040d98d" FOREIGN KEY ("fleet_id") REFERENCES "fleets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_5c1053a84fdbe26c7388cdd1049" FOREIGN KEY ("driver_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_log_photos" ADD CONSTRAINT "FK_7e5573cb1299905ebb698018f98" FOREIGN KEY ("log_id") REFERENCES "request_logs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_logs" ADD CONSTRAINT "FK_c3473f89532dbd640696cf61ed9" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_objects" ADD CONSTRAINT "FK_8f04f65e9cde00ef2a8d4f594fc" FOREIGN KEY ("type_id") REFERENCES "notification_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_objects" ADD CONSTRAINT "FK_dbae68abe17804a8865741ddc8b" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_f82e4241b5c3d360a7a5faf79bb" FOREIGN KEY ("notifier_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_38b93a8b6cd5a4fedf9834776d8" FOREIGN KEY ("object_id") REFERENCES "notification_objects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_views" ADD CONSTRAINT "FK_ec6fa1a61d4ccd78b74c2398acf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_views" ADD CONSTRAINT "FK_1068896619febf5d1c52b16031d" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "device_tokens" ADD CONSTRAINT "FK_17e1f528b993c6d55def4cf5bea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "device_tokens" DROP CONSTRAINT "FK_17e1f528b993c6d55def4cf5bea"`);
        await queryRunner.query(`ALTER TABLE "notification_views" DROP CONSTRAINT "FK_1068896619febf5d1c52b16031d"`);
        await queryRunner.query(`ALTER TABLE "notification_views" DROP CONSTRAINT "FK_ec6fa1a61d4ccd78b74c2398acf"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_38b93a8b6cd5a4fedf9834776d8"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_f82e4241b5c3d360a7a5faf79bb"`);
        await queryRunner.query(`ALTER TABLE "notification_objects" DROP CONSTRAINT "FK_dbae68abe17804a8865741ddc8b"`);
        await queryRunner.query(`ALTER TABLE "notification_objects" DROP CONSTRAINT "FK_8f04f65e9cde00ef2a8d4f594fc"`);
        await queryRunner.query(`ALTER TABLE "request_logs" DROP CONSTRAINT "FK_c3473f89532dbd640696cf61ed9"`);
        await queryRunner.query(`ALTER TABLE "request_log_photos" DROP CONSTRAINT "FK_7e5573cb1299905ebb698018f98"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_5c1053a84fdbe26c7388cdd1049"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_35988fbcc37a5be91889040d98d"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_210052a4b94dfd2394b07ebde1d"`);
        await queryRunner.query(`ALTER TABLE "fleet_photos" DROP CONSTRAINT "FK_191b3faf32bc95905f6a16aff09"`);
        await queryRunner.query(`DROP TABLE "device_tokens"`);
        await queryRunner.query(`DROP TABLE "notification_views"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "notification_objects"`);
        await queryRunner.query(`DROP TABLE "notification_types"`);
        await queryRunner.query(`DROP TABLE "request_logs"`);
        await queryRunner.query(`DROP TYPE "public"."request_logs_type_enum"`);
        await queryRunner.query(`DROP TABLE "request_log_photos"`);
        await queryRunner.query(`DROP TABLE "requests"`);
        await queryRunner.query(`DROP TYPE "public"."requests_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."requests_type_enum"`);
        await queryRunner.query(`DROP TABLE "fleets"`);
        await queryRunner.query(`DROP TYPE "public"."fleets_type_enum"`);
        await queryRunner.query(`DROP TABLE "fleet_photos"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
