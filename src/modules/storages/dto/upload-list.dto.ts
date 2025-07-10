import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty } from "class-validator";
import { StorageFolderEnum } from "../enum/storage-folder.enum";

export class UploadListDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    readonly file_names: string[];

    @ApiProperty({
        enum: StorageFolderEnum,
    })
    @IsEnum(StorageFolderEnum)
    readonly folder: StorageFolderEnum;
}