import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerIdsAndRequest1716296205515 implements MigrationInterface {
    name = 'AddCustomerIdsAndRequest1716296205515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "id_photo" TO "photo_profile"`);
        await queryRunner.query(`CREATE TABLE "user_id_cards" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" bigint, "photo" character varying NOT NULL, CONSTRAINT "PK_96e266d7880816e42a851892c78" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "requests" ADD "distance" double precision`);
        await queryRunner.query(`ALTER TABLE "user_id_cards" ADD CONSTRAINT "FK_96257c81bc81bb985e967328b63" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_id_cards" DROP CONSTRAINT "FK_96257c81bc81bb985e967328b63"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP COLUMN "distance"`);
        await queryRunner.query(`DROP TABLE "user_id_cards"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "photo_profile" TO "id_photo"`);
    }

}
