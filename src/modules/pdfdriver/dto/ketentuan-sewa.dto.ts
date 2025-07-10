export type Section = {
  title: string;
  items: { subtitle: string; content: string | string[] }[];
};

export class KetentuanSewa {

  // Pengantaran
  static getKetentuanSewaFormatted(): Section[] {
    return [
      {
        title: 'Ketentuan Umum',
        items: [
          { subtitle: 'Pemesanan dan Perpanjangan', content: 'Pemesanan atau perpanjangan sewa wajib dilakukan minimal 24 jam sebelum waktu penggunaan.' },
          { subtitle: 'Dokumen Penyewa', content: 'Penyewa wajib menyediakan foto dokumen berikut: KTP, SIM A, NPWP, KK, ID Kerja/Pelajar, serta akun media sosial aktif.' },
          { subtitle: 'Verifikasi Dokumen', content: 'Proses verifikasi dokumen harus diselesaikan minimal 4 jam sebelum waktu penggunaan.' },
          { subtitle: 'Lokasi Serah Terima', content: 'Lokasi pengambilan dan pengembalian mobil akan ditentukan bersama penyedia rental.' }
        ]
      },
      {
        title: 'Serah Terima Unit',
        items: [
          { subtitle: '', content: 'Penyewa wajib menunjukkan dokumen asli saat serah terima unit.' },
          { subtitle: '', content: 'Penyewa wajib memberikan 1 jaminan kepada Tim Serah Terima Transgo saat serah terima unit.' }
        ]
      },
      {
        title: 'Kewajiban Penyewa',
        items: [
          { subtitle: 'Tanggung Jawab Penggunaan', content: 'Bertanggung jawab penuh atas penggunaan kendaraan, termasuk segala bentuk pelanggaran lalu lintas dan parkir.' },
          { subtitle: 'Larangan Penggadaian/Pemindahtangankan', content: 'Tidak menggadaikan atau memindahtangankan unit kepada pihak lain.' },
          { subtitle: 'Wilayah Penggunaan', content: 'Menggunakan kendaraan sesuai wilayah yang telah disepakati.' },
          { subtitle: 'Kapasitas Kendaraan', content: 'Tidak membawa penumpang atau barang melebihi kapasitas kendaraan.' },
          { subtitle: 'Kebersihan dan Bau', content: 'Tidak merokok atau meninggalkan sampah yang menyebabkan aroma tidak sedap di dalam kendaraan.' },
          { subtitle: 'Kondisi Mengemudi', content: 'Tidak mengemudi dalam keadaan mabuk atau tidak sadar.' },
          { subtitle: 'Pengembalian Unit', content: 'Mengembalikan unit dalam kondisi bersih dan dengan bahan bakar yang sama seperti saat pengambilan.' }
        ]
      },
      {
        title: 'Biaya Tambahan',
        items: [
          {
            subtitle: 'Overtime',
            content: [
              'Konfirmasi: Konfirmasi penambahan waktu maksimal 8 jam sebelum masa sewa berakhir.',
              'Biaya: Biaya overtime adalah 15% per jam dari harga sewa.',
              'Batas Overtime: Maksimal overtime adalah 3 jam. Lebih dari itu, akan dikenakan biaya sewa satu hari penuh.'
            ]
          },
          {
            subtitle: 'Bensin',
            content: [
              'Sistem: Menggunakan sistem range to range. Denda: Jika bahan bakar kurang dari jumlah awal:',
              'Mobil: Rp50.000/bar',
              'Motor: Rp10.000/bar'
            ]
          },
          {
            subtitle: 'Pengembalian Unit',
            content: [
              'Kondisi Kotor:',
              'Mobil: Denda Rp200.000',
              'Motor: Denda Rp50.000'
            ]
          },
          {
            subtitle: 'Pengembalian di Luar Jam Kerja',
            content: 'Pengembalian di luar jam kerja (06.30-21.00) akan dikenakan biaya tambahan sesuai syarat dan ketentuan sewa.'
          },
          {
            subtitle: 'Pemakaian Luar Kota Tanpa Konfirmasi',
            content: 'Dikenakan penalti 2x harga sewa normal luar kota.'
          }
        ]
      },
      {
        title: 'Fasilitas Special Package Car Transgo',
        items: [
          {
            subtitle: '',
            content: [
              'Pengisi daya Tipe C merek Log On: Rp25.000,00',
            ]
          },
          {
            subtitle: '',
            content: [
              'Pengisi daya iPhone merek Log On: Rp30.000,00',

            ]
          },
                  {
            subtitle: '',
            content: [
              'Senter: Rp10.000,00',
            ]
          },
                  {
            subtitle: '',
            content: [
              'Lighter mobil: Rp60.000,00',
            ]
          },
                  {
            subtitle: '',
            content: [
              'Kartu Flazz/e-money (kartu saja): Rp50.000,00'
            ]
          },
        ]
      },
      {
        title: 'Kerusakan & Kehilangan',
        items: [
          {
            subtitle: 'Tanggung Jawab Umum',
            content: 'Penyewa bertanggung jawab atas kehilangan atau seluruh kerusakan unit yang terjadi, termasuk STNK, kunci, aksesori, alat mobil, head unit, kursi, serta biaya sewa kendaraan selama perbaikan.'
          },
          {
            subtitle: 'Kecelakaan Berat',
            content: 'Jika terjadi kecelakaan dengan kerusakan di atas 40%, penyewa wajib menanggung biaya penggantian suku cadang, cat, mesin, serta biaya sewa kendaraan selama perbaikan.'
          },
          {
            subtitle: 'Dokumen Asuransi',
            content: 'Penyewa wajib menyerahkan dokumen yang dibutuhkan oleh asuransi jika menggunakan metode asuransi.'
          }
        ]
      },
      {
        title: 'Konfirmasi Penyewa',
        items: [
          {
            subtitle: '',
            content:
              'Dengan dibayarnya invoice dan penandatanganan perjanjian ini, penyewa menyatakan menyetujui seluruh ketentuan yang telah disebutkan di atas dan bertanggung jawab penuh atas kepatuhan terhadap aturan yang berlaku. Jika terbukti melanggar, pihak rental berhak menuntut ganti rugi sesuai kebijakan perusahaan rental.'
          }
        ]
      }
    ];
  }
  
    // Pengembalian
    static getKondisiKendaraan(): string[] {
      return [
        'Unit dikembalikan dalam keadaan bersih dan dengan bahan bakar sesuai ketentuan awal',
        'Apabila terdapat lecet, goresan, atau kerusakan lain pada kendaraan yang tidak ada pada saat pengambilan, hal tersebut akan didokumentasikan bersama oleh kedua belah pihak.',
        'Pemeriksaan fisik kendaraan dilakukan secara menyeluruh bersama penyewa dan didokumentasikan melalui foto/video.',
        'Saya telah mengembalikan unit dalam kondisi baik. Apabila di kemudian hari ditemukan kerusakan seperti pergantian ban serep, kehilangan aksesoris, kerusakan pada lighter, indikasi bekas banjir, atau penggunaan yang tidak wajar, maka saya bersedia bertanggung jawab penuh atas kerugian yang ditagihkan oleh pihak Transgo.',
        'Jika unit dikembalikan dalam kondisi berbau menyengat atau terindikasi digunakan untuk membawa hewan, saya juga bersedia bertanggung jawab penuh atas konsekuensi atau biaya pembersihan yang dibebankan oleh pihak Transgo.',
      ];
    }
  
    static getBiayaTambahanPengembalian(): string[] {
      return [
        'Jika terdapat pelanggaran lalu lintas berupa ETLE (Electronic Traffic Law Enforcement) atau tilang elektronik selama masa sewa, saya menyatakan bersedia membayar denda sesuai informasi dan tagihan yang akan disampaikan oleh admin Transgo.id kemudian hari.',
        'Biaya keterlambatan pengembalian unit tanpa konfirmasi akan dikenakan denda sesuai ketentuan sewa.',
      ];
    }
  
    static getInsidenKerusakan(): string[] {
      return [
        'Setiap insiden atau kerusakan yang terjadi selama masa sewa wajib dilaporkan dan dikonfirmasi kepada pihak Transgo.id.',
        'Jika terbukti bahwa kerusakan atau insiden tersebut merupakan tanggung jawab saya sebagai penyewa, maka saya bersedia menanggung biaya perbaikan atau ganti rugi sesuai kesepakatan bersama.',
        'Penyewa wajib mengganti biaya perbaikan termasuk jasa bengkel resmi jika diperlukan.'
      ];
    }
  
    static getPenggantianUnit(): string[] {
      return [
        'Setiap insiden atau kerusakan yang terjadi selama masa sewa wajib dilaporkan dan dikonfirmasi kepada pihak Transgo.id.',
        'Jika terbukti bahwa kerusakan atau insiden tersebut merupakan tanggung jawab saya sebagai penyewa, maka saya bersedia menanggung biaya perbaikan atau ganti rugi sesuai kesepakatan bersama.',
        'Penyewa wajib mengganti biaya perbaikan termasuk jasa bengkel resmi jika diperlukan.'
      ];
    }
  
    static getDokumenDanKelengkapan(): string[] {
      return [
        'Saya telah menyerahkan semua dokumen asli seperti STNK serta kunci lengkap kepada pihak rental saat pengembalian unit.',
      ];
    }
  
    static getLaranganModifikasi(): string[] {
      return [
        'Setiap insiden atau kerusakan yang terjadi selama masa sewa wajib dilaporkan dan dikonfirmasi kepada pihak Transgo.id.',
        'Jika terbukti bahwa kerusakan atau insiden tersebut merupakan tanggung jawab saya sebagai penyewa, maka saya bersedia menanggung biaya perbaikan atau ganti rugi sesuai kesepakatan bersama.',
        'Penyewa wajib mengganti biaya perbaikan termasuk jasa bengkel resmi jika diperlukan.'
      ];
    }
  
    static getTanggungJawab(): string[] {
      return [
        'Rental tidak bertanggung jawab atas kehilangan barang bawaan selama masa sewa maupun setelah pengembalian unit.',
      ];
    }
  
    static getPengakuanTanggungJawab(): string[] {
      return [
        'Dengan menandatangani dokumen ini, saya menyatakan telah menerima kondisi kendaraan saat pengembalian serta memahami kewajiban pembayaran atas segala biaya tambahan maupun kerugian yang timbul akibat pelanggaran aturan sewa.',
      ];
    }
  }
  