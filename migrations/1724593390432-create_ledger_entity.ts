import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLedgerEntity1724593390432 implements MigrationInterface {
    name = 'CreateLedgerEntity1724593390432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ledger_categories" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, CONSTRAINT "PK_ed81165b44a135df7a12f40ecfa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ledgers" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "fleet_id" bigint NOT NULL, "category_id" bigint NOT NULL, "user_id" bigint, "order_id" bigint, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "duration" integer, "credit_amount" double precision, "debit_amount" double precision, "status" character varying NOT NULL DEFAULT 'pending', "description" character varying, CONSTRAINT "PK_e8af998892a129f7cf69285d601" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ledgers" ADD CONSTRAINT "FK_9ea8427884677e02c4fbc9e621b" FOREIGN KEY ("fleet_id") REFERENCES "fleets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ledgers" ADD CONSTRAINT "FK_0a54cf7b2d609e53014ec613223" FOREIGN KEY ("category_id") REFERENCES "ledger_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ledgers" ADD CONSTRAINT "FK_6facac6c75434fe41883d3df83d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ledgers" ADD CONSTRAINT "FK_26984a28d8e9936c88bceed0606" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ledgers" DROP CONSTRAINT "FK_26984a28d8e9936c88bceed0606"`);
        await queryRunner.query(`ALTER TABLE "ledgers" DROP CONSTRAINT "FK_6facac6c75434fe41883d3df83d"`);
        await queryRunner.query(`ALTER TABLE "ledgers" DROP CONSTRAINT "FK_0a54cf7b2d609e53014ec613223"`);
        await queryRunner.query(`ALTER TABLE "ledgers" DROP CONSTRAINT "FK_9ea8427884677e02c4fbc9e621b"`);
        await queryRunner.query(`DROP TABLE "ledgers"`);
        await queryRunner.query(`DROP TABLE "ledger_categories"`);
    }
}
