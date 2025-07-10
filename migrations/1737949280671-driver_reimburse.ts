import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class  driver_reimburse1737949280671 implements MigrationInterface {
    name = ' driver_reimburse1737949280671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // table driver_reimburse
        // update field proccessed_at, attachment_url, serta merubah type dari varchar ke character varying 
        await queryRunner.query(`
            CREATE TABLE "driver_reimburse" (
                "id" BIGSERIAL NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT  now(),
                "deleted_at" TIMESTAMP,
                "driver_id" BIGINT NOT NULL,
                "nominal" DOUBLE PRECISION NOT NULL, 
                "bank" VARCHAR NOT NULL,
                "No_rekening" VARCHAR NOT NULL,
                "location_id" BIGINT NOT NULL,
                "date" DATE NOT NULL,
                "description" TEXT,
                "status" CHARACTER VARYING NOT NULL DEFAULT 'pending',
                CONSTRAINT "PK_driver_reimburse" PRIMARY KEY ("id")
            )    
        `);
            // relasi dengan table users
            await queryRunner.query(`
                ALTER TABLE "driver_reimburse"
                ADD CONSTRAINT "FK_driver_reimburse_user"
                FOREIGN KEY ("driver_id")
                REFERENCES "users"("id")
                ON DELETE CASCADE ON UPDATE CASCADE
            `);

            // relasi dengan table locations
            await queryRunner.query(`
                ALTER TABLE "driver_reimburse"
                ADD CONSTRAINT "FK_driver_reimburse_location"
                FOREIGN KEY ("location_id")
                REFERENCES "locations"("id")
                ON DELETE SET NULL ON UPDATE CASCADE
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //delete relasi ke table user
        await queryRunner.query(`
            ALTER TABLE "driver_reimburse"
            DROP CONSTRAINT "FK_driver_reimburse_user"
        `);
        // delete relasi ke table location
        await queryRunner.query(`
            ALTER TABLE "driver_reimburse"
            DROP CONSTRAINT "FK_driver_reimburse_location"
        `);
        await queryRunner.query(`DROP TABLE "driver_reimburse"`);
    }

}
