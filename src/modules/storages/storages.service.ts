import * as dotenv from 'dotenv'
import { Injectable } from '@nestjs/common';
import * as Minio from 'minio'
import { FileStringHelper } from 'src/config/helper/string/file_string.helper';
import { UploadDto } from './dto/upload.dto';
import { UploadListDto } from './dto/upload-list.dto';

dotenv.config();

@Injectable()
export class StoragesService {

    private s3SSL = process.env.S3_USE_SSL === 'true' ? true : false;
    private s3 = new Minio.Client({
        endPoint: process.env.S3_HOST,
        port: Number(process.env.S3_PORT),
        useSSL: this.s3SSL,
        accessKey: process.env.S3_ACCESS_KEY,
        secretKey: process.env.S3_SECRET_KEY,
        region: process.env.S3_REGION,
    });

    async getPresign(dto: UploadDto) {
        return this.presign(dto);
    }

    async getPresignList(dto: UploadListDto) {
        return await Promise.all(dto.file_names.map(async element => {
            return await this.presign({ folder: dto.folder, file_name: element });
        }));
    }

    private async presign({ folder, file_name }, putExpires: number = 180) {
        const fileName = `${folder}/${FileStringHelper.customFileName(file_name)}`;

        const presignedPutUrl = await this.s3.presignedPutObject(process.env.S3_BUCKET_NAME, fileName, putExpires);
        const downloadUrl = `${this.s3SSL ? 'https' : 'http'}://${process.env.S3_HOST}:${process.env.S3_PORT}/${process.env.S3_BUCKET_NAME}/${fileName}`;

        return {
            'download_url': downloadUrl,
            'upload_url': presignedPutUrl,
        }
    }
}
