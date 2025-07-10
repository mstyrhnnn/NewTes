import { htmlBlockQuote, defaultSupportText, emailTransgo } from "src/modules/mail/template/email.template";

export const CREATED_USER_MESSAGE = 'Akun pelanggan Anda telah diregistrasi ke sistem Transgo dan menunggu verifikasi dari Admin. Mohon tunggu selama proses verifikasi sedang berlangsung.<br><br>Untuk langkah selanjutnya, tunggu kabar melalui email / whatsapp ya.';

export const VERIFIED_USER_MESSAGE = 'Akun pelanggan Anda telah dibuat dan diverifikasi oleh Admin Transgo. Sekarang Anda bisa mulai menyewa armada milik Transgo secara online.';

export const NEED_OTHER_DATA = (reason: string) => `Akun Anda Telah Diverifikasi, Namun Memerlukan Tindakan Lanjutan. <br><br> Kami informasikan bahwa akun Anda telah berhasil diverifikasi oleh tim Admin Transgo. Namun, untuk menyelesaikan proses aktivasi dan dapat mulai menggunakan layanan kami secara penuh, Anda diminta untuk mengunggah data tambahan sesuai dengan permintaan dari tim admin. <br> Pesan Admin: <br><br>${htmlBlockQuote(reason)}<br><br>`;

export const VERIFIED_USER_SUPPORT_TEXT = `<b style='color:red;'>Harap diperhatikan bahwa tautan untuk mengatur ulang kata sandi akan kedaluwarsa setelah 7 hari. Mohon segera lakukan pengaturan kata sandi. Jika tautan sudah kedaluwarsa, Anda dapat menggunakan "Lupa Kata Sandi" untuk mengatur ulang kata sandi Anda kembali.</b><br><br>${defaultSupportText}`;

export const REJECTED_USER_MESSAGE = (reason: string) => `Kami menyesal menginformasikan bahwa akun pelanggan Anda telah ditolak oleh Admin Transgo dengan alasan:<br><br>${htmlBlockQuote(reason)}<br><br> <b style='color:red;'>Mohon periksa kembali data yang Anda berikan dan coba registrasi ulang dengan informasi yang benar.</b><br><br>Jika Anda memiliki pertanyaan atau membutuhkan bantuan lebih lanjut, silakan hubungi kami di ${emailTransgo}`;

export const ACCEPTED_ORDER_MESSAGE = (fleetType: string, fleetName: string, duration: string) => `Permintaan sewa armada ${fleetType} - ${fleetName} telah disetujui oleh Admin selama ${duration} hari. Lihat di halaman Transgo anda untuk melihat detail konfirmasi Admin dan invoice atas pesanan Anda.<br><br>Klik tombol di bawah ini untuk membuka halaman Transgo Anda.`;
export const ACCEPTED_ORDER_SUPPORT_TEXT = `<b style='color:red;'>Pastikan anda melakukan transfer pembayaran ketika armada datang untuk menghindari penipuan.</b><br><br>${defaultSupportText}`;

export const REJECTED_ORDER_MESSAGE = (fleetType: string, fleetName: string, duration: string, reason: string) => `Kami menyesal menginformasikan bahwa permintaan sewa armada ${fleetType} - ${fleetName} Anda selama ${duration} hari telah ditolak oleh Admin dengan alasan:<br><br>${htmlBlockQuote(reason)}<br><br>Mohon periksa kembali informasi pesanan Anda dan coba lakukan permintaan ulang dengan data yang benar.<br><br>Klik tombol di bawah ini untuk membuka halaman Transgo Anda.`;
export const REJECTED_ORDER_SUPPORT_TEXT = `Jika Anda memiliki pertanyaan atau membutuhkan bantuan lebih lanjut, silakan hubungi kami di ${emailTransgo}`;

export const PAID_ORDER_ADMIN_MESSAGE = (customerName: string, fleetType: string, fleetName: string, duration: string) => `${customerName} telah membayar biaya untuk sewa armada ${fleetType} -${fleetName} selama ${duration} hari. Klik tombol di bawah ini untuk membuka detail sewa.`;

export const CHANGES_ORDER_MESSAGE = (changes: string[]) => `Permintaan sewa Anda telah diubah oleh Admin sesuai kesepakatan dengan detail sebagai berikut: <ul>${changes.map(change => `<li>${change}</li>`).join('')}</ul><br>Lihat di halaman Transgo anda untuk melihat detail konfirmasi Admin dan invoice atas pesanan Anda.<br>Klik tombol di bawah ini untuk membuka halaman Transgo Anda.`;

export const CUSTOMER_CANCEL_MESSAGE = (
    fleetType: string,
    fleetName: string,
    duration: string,
    startSewa: string,
    endSewa: string,
) => `Permintaan sewa Anda telah dicancel oleh Admin sesuai kesepakatan dengan detail sebagai berikut:
<ul>
<li>Sewa armada ${fleetType} - ${fleetName} selama ${duration} hari.</li>
<li>Tanggal Ambil ${startSewa}</li>
<li>Tanggal Kembali ${endSewa}</li>
</ul>
`

export const ADMIN_CANCEL_MESSAGE = (
    customerName: string,
    fleetType: string,
    fleetName: string,
    duration: string,
    startSewa: string,
    endSewa: string,
) => `${customerName} telah membatalkan pesanan sewa armada ${fleetType} - ${fleetName} selama ${duration} hari. Dengan detail sebagai berikut:
<ul>
<li>Tanggal Ambil ${startSewa}</li>
<li>Tanggal Kembali${endSewa}</li>
</ul>

Lihat di halaman Calendar Transgo anda untuk melihat kekosongan jadwal atas pesanan pelanggan. Klik tombol di bawah ini untuk membuka halaman Transgo Anda.
`