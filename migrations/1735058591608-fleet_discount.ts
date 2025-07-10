import { MigrationInterface, QueryRunner } from "typeorm";

export class FleetDiscount1735058591608 implements MigrationInterface {
    name = 'FleetDiscount1735058591608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fleet_discount" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "discount" integer NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, CONSTRAINT "PK_2cbe74b9539aa7ca7464ee6e2b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "fleets" ALTER COLUMN "commission" SET DEFAULT '{"transgo":null,"owner":null,"partner":null}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fleets" ALTER COLUMN "commission" SET DEFAULT '{"owner": null, "partner": null, "transgo": null}'`);
        await queryRunner.query(`DROP TABLE "fleet_discount"`);
    }

}
