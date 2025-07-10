import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Res,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { Multer } from 'multer'; 
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/config/guard/jwt-auth.guard';
import { RoleGuard } from 'src/config/auth/role/role.guard';
import { RoleType } from 'src/config/auth/role/role.enum';
import { RoleTypes } from 'src/config/auth/role/role.decorator';
import { GeneratePdfDto } from './dto/generate-pdf.dto';

@Controller({
  version: '1',
  path: 'pdf',
})
@ApiTags('v1/pdf')

export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN, RoleType.DRIVER)
  @ApiBearerAuth()
  @Post('generate')
  @UseInterceptors(FileInterceptor('signature'))
  async generatePdf(@UploadedFile() file: Multer.File, @Body() body: GeneratePdfDto, @Res() res: Response ) {
    const buffer = await this.pdfService.generatePdfBuffer({
      signer_name: body.signer,
      signature: file?.buffer || null,
      type_signature: body.type,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="streamed.pdf"',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}