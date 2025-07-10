import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { KetentuanSewa, Section } from './dto/ketentuan-sewa.dto';
import { SignatureType } from './dto/generate-pdf.dto';
import * as dayjs from 'dayjs';
import 'dayjs/locale/id'; 

@Injectable()
export class PdfService {
  
  private drawNumberedList(doc: PDFDocument, items: string[], type: 'number' | 'bullet' = 'number') {
    const numberWidth = 20;
    const bulletMargin = 5;
    const startX = doc.x;
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    items.forEach((text, i) => {
      const currentY = doc.y;
      const prefix = type === 'number' ? `${i + 1}.` : '•';

      doc.font('Helvetica-Bold').fontSize(11).text(prefix, startX, currentY, {
        width: numberWidth,
      });

      doc.font('Helvetica').fontSize(11).text(text, startX + numberWidth + bulletMargin, currentY, {
        width: pageWidth - numberWidth - bulletMargin,
        align: 'justify',
      });

      doc.moveDown(0.5);
    });
  }

  // Pengantaran
  private drawHierarchicalList(doc: PDFDocument, sections: Section[]) {
    const baseFontSize = 11;
    const sectionTitleSize = 12;
    const indentLeft = 25;
    const lineSpacing = 6;
    const sublistSpacing = 3;
    const pageLeft = doc.page.margins.left;
    
    sections.forEach((section, i) => {
      const sectionNumber = `${i + 1}.`;
      const sectionTitle = `${sectionNumber} ${section.title}`;

      if ([3, 6].includes(i)) {
        doc.addPage();
      }

      doc.moveDown(0.8).font('Helvetica-Bold').fontSize(sectionTitleSize).text(sectionTitle, pageLeft);

      doc.moveDown(0.5);

      section.items.forEach((item, j) => {
        const itemNumber = `${i + 1}.${j + 1}`;
        const label = item.subtitle ? `${itemNumber} ${item.subtitle}: ` : `${itemNumber} `;
        const content = item.content;

        doc.font('Helvetica-Bold').fontSize(baseFontSize);
        const labelWidth = doc.widthOfString(label);
        const startX = pageLeft + indentLeft;
        const contentWidth = doc.page.width - doc.page.margins.right - startX;

        doc.font('Helvetica-Bold').fontSize(baseFontSize).text(label, startX, doc.y, {continued: true});

        doc.font('Helvetica').text(content, {
          width: contentWidth - labelWidth,
          indent: 0,
          lineGap: lineSpacing,
          paragraphGap: sublistSpacing,
        });

        doc.moveDown(0.3);

      });

      doc.moveDown(1);
    });
  }

  // Pengembalian
  private addPengembalianDetails(doc: PDFDocument) {
    const sections = [
      { title: 'Kondisi Kendaraan', list: KetentuanSewa.getKondisiKendaraan(), },
      { title: 'Biaya Tambahan', list: KetentuanSewa.getBiayaTambahanPengembalian() },
      { title: 'Insiden Dan Kerusakan', list: KetentuanSewa.getInsidenKerusakan() },
      { title: 'Penggantian Unit', list: KetentuanSewa.getPenggantianUnit() },
      { title: 'Dokumen Dan Kelengkapan', list: KetentuanSewa.getDokumenDanKelengkapan() },
      { title: 'Larangan Modifikasi & Pemakaian Wilayah', list: KetentuanSewa.getLaranganModifikasi() },
      { title: 'Tanggung Jawab atas Barang Bawaan', list: KetentuanSewa.getTanggungJawab() },
      { title: 'Pengakuan Tanggung Jawab', list: KetentuanSewa.getPengakuanTanggungJawab() },
    ];
  
    sections.forEach((section) => {
      doc.fontSize(12).font('Helvetica-Bold').text(section.title, doc.page.margins.left);
      doc.moveDown();
      this.drawNumberedList(doc, section.list, 'bullet');
      doc.moveDown();
    });
  }

  
  private generateHeader(doc: PDFDocument, data: { type_signature?: string }) {
    const { type_signature } = data;
  
    if (type_signature === SignatureType.PENGANTARAN || type_signature === SignatureType.PENGAMBILAN) {
        const sections = KetentuanSewa.getKetentuanSewaFormatted();
        this.drawHierarchicalList(doc, sections);

    } else if (type_signature === SignatureType.PENJEMPUTAN || type_signature === SignatureType.PENGEMBALIAN) {
        doc.fontSize(14).font('Helvetica-Bold').text(
            'Pernyataan Serah Terima Pengembalian Unit',
            doc.page.margins.left + (doc.page.width - doc.page.margins.left - doc.page.margins.right - doc.widthOfString('Pernyataan Serah Terima Pengembalian Unit')) / 2
        );
        doc.moveDown()
        doc.fontSize(12).font('Helvetica-Bold').text(
            'Dengan ini, saya sebagai penyewa menyatakan bahwa saya telah mengembalikan unit kendaraan kepada pihak Transgo.id dalam kondisi sebagai berikut:',
            doc.page.margins.left
        );

        doc.moveDown();
        this.addPengembalianDetails(doc);

    } else {
        doc.fontSize(14).font('Helvetica-Bold').text(
            'Tipe Tasks Tidak Sesuai',
            doc.page.margins.left
        );
    }
}


  private generateSignatureSection(doc: PDFDocument, data: { signer_name: string; signature?: Buffer }) {
    dayjs.locale('id');
    const bottomPadding = 67;
    const boxWidth = 200;
    const boxHeight = 120;
    const boxX = doc.page.width - doc.page.margins.right - boxWidth;
    const boxY = doc.page.height - bottomPadding - boxHeight;
    const formattedDate = dayjs().format('DD MMMM YYYY');

  
    doc.fontSize(10).font('Helvetica')
      .text(`Tanggal: ${formattedDate}`, boxX, boxY - 18, { width: boxWidth, align: 'center' });
  
    doc.rect(boxX, boxY, boxWidth, boxHeight);
  
    if (data.signature) {
      try {
        doc.image(data.signature, boxX + 5, boxY + 5, {
          fit: [boxWidth - 10, boxHeight - 10],
          align: 'center',
          valign: 'center',
        });
      } catch (e) {
        doc.fontSize(8).fillColor('red')
          .text('Gagal memuat gambar', boxX + 5, boxY + 5, { width: boxWidth - 10 });
      }
    }
  
    doc.fontSize(10).fillColor('black')
      .text(data.signer_name || 'Tanda Tangan', boxX, boxY + boxHeight + 5, {
        width: boxWidth,
        align: 'center',
      });
  }  

async generatePdfBuffer(data: {signer_name: string; signature?: Buffer; type_signature?: string; }): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
  
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
  
      // Body section
      this.generateHeader(doc, data);
  
      // Signature Section
      this.generateSignatureSection(doc, data);
  
      doc.end();
    });
  }
  
}