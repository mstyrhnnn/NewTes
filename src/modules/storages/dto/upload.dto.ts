import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { StorageFolderEnum } from "../enum/storage-folder.enum";

export class UploadDto {

    @ApiProperty()
    @IsNotEmpty()
    readonly file_name: string;

    @ApiProperty({
        enum: StorageFolderEnum,
    })
    @IsEnum(StorageFolderEnum)
    readonly folder: StorageFolderEnum;
}