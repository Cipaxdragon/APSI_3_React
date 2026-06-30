import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoBase64 } from './logoBase64';

export const generateBeritaAcara = (student, schedule) => {
  try {
    const doc = new jsPDF();
    
    // Header / Kop Surat (Mock)
    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.text("UNIVERSITAS ISLAM NEGERI ALAUDDIN MAKASSAR", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text("FAKULTAS SAINS DAN TEKNOLOGI", 105, 28, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text(`Program Studi ${student.prodi}`, 105, 34, { align: "center" });
  
  // Line separator
  doc.setLineWidth(1);
  doc.line(20, 38, 190, 38);
  doc.setLineWidth(0.3);
  doc.line(20, 39, 190, 39);

  // Title
  const title = `BERITA ACARA UJIAN ${schedule.jenisUjian.toUpperCase()}`;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 105, 50, { align: "center" });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const intro = `Pada hari ini, tanggal ${schedule.tanggal}, bertempat di ${schedule.ruangan}, telah dilaksanakan Ujian ${schedule.jenisUjian === 'munaqasyah' ? 'Skripsi (Munaqasyah)' : schedule.jenisUjian === 'hasil' ? 'Seminar Hasil' : 'Proposal'} atas nama mahasiswa:`;
  const splitIntro = doc.splitTextToSize(intro, 170);
  doc.text(splitIntro, 20, 65);
  
  // Student Info
  let currentY = 75 + (splitIntro.length - 1) * 6;
  doc.text("Nama", 25, currentY); doc.text(`: ${student.nama}`, 60, currentY); currentY += 7;
  doc.text("NIM", 25, currentY); doc.text(`: ${student.nim}`, 60, currentY); currentY += 7;
  doc.text("Program Studi", 25, currentY); doc.text(`: ${student.prodi}`, 60, currentY); currentY += 7;
  doc.text("Judul Skripsi", 25, currentY); 
  
  const splitJudul = doc.splitTextToSize(`: ${student.judul}`, 125);
  doc.text(splitJudul, 60, currentY);
  currentY += splitJudul.length * 6 + 5;
  
  doc.text("Dengan susunan Majelis Penguji sebagai berikut:", 20, currentY);
  currentY += 8;

  // Table Penguji
  const pengujiData = [];
  if (schedule.ketuaSidang) pengujiData.push(["1", "Ketua Sidang", schedule.ketuaSidang]);
  if (schedule.sekretaris) pengujiData.push(["2", "Sekretaris", schedule.sekretaris]);
  if (schedule.penguji1) pengujiData.push(["3", "Penguji 1", schedule.penguji1]);
  if (schedule.penguji2) pengujiData.push(["4", "Penguji 2", schedule.penguji2]);

  autoTable(doc, {
    startY: currentY,
    head: [['No', 'Jabatan', 'Nama Penguji', 'Tanda Tangan']],
    body: pengujiData.map(r => [...r, '']),
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] }, // Tailwind blue-500
    columnStyles: { 
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 70 },
      3: { cellWidth: 45 }
    },
    didDrawCell: (data) => {
      if (data.column.index === 3 && data.section === 'body') {
        doc.setFontSize(8);
        doc.text(`${data.row.index + 1}. .........`, data.cell.x + 5, data.cell.y + Math.max(data.cell.height/2, 5));
      }
    }
  });

  // --- HALAMAN 2: DAFTAR HADIR AUDIENS ---
  doc.addPage();
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`DAFTAR HADIR AUDIENS ${schedule.jenisUjian.toUpperCase()}`, 105, 25, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nama Pemateri  : ${student.nama}`, 20, 35);
  doc.text(`NIM Pemateri     : ${student.nim}`, 20, 41);
  doc.text(`Tanggal Ujian    : ${schedule.tanggal}`, 20, 47);

  const audiensData = Array.from({ length: 15 }, (_, i) => [(i + 1).toString(), "", "", "", ""]);
  
  autoTable(doc, {
    startY: 55,
    head: [['No', 'Nama Mahasiswa', 'NIM', 'Program Studi', 'Tanda Tangan']],
    body: audiensData,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 10, minCellHeight: 12, valign: 'middle' },
    headStyles: { fillColor: [59, 130, 246] },
    columnStyles: { 
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 55 },
      2: { cellWidth: 35 },
      3: { cellWidth: 40 },
      4: { cellWidth: 35 }
    },
    didDrawCell: (data) => {
      if (data.column.index === 4 && data.section === 'body') {
        doc.setFontSize(8);
        const yPos = data.cell.y + 7;
        // Posisi zigzag untuk tanda tangan (kiri-kanan)
        if (data.row.index % 2 === 0) {
           doc.text(`${data.row.index + 1}. .............`, data.cell.x + 2, yPos);
        } else {
           doc.text(`${data.row.index + 1}. .............`, data.cell.x + 15, yPos);
        }
      }
    }
  });

  doc.save(`Berita_Acara_${student.nim}_${schedule.jenisUjian}.pdf`);
  } catch (error) {
    console.error("PDF Generation Error: ", error);
    alert("Gagal membuat PDF: " + error.message);
  }
};

export const generateLembarPengesahan = (student, schedule) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Add Watermark
    doc.setGState(new doc.GState({opacity: 0.1}));
    // Assuming the logo is square, we center it
    const logoSize = 120;
    doc.addImage(logoBase64, 'PNG', (210 - logoSize)/2, (297 - logoSize)/2, logoSize, logoSize);
    doc.setGState(new doc.GState({opacity: 1.0}));
    
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    const titleText = schedule.jenisUjian === 'munaqasyah' ? "PENGESAHAN SKRIPSI" : schedule.jenisUjian === 'hasil' ? "PENGESAHAN SEMINAR HASIL" : "PENGESAHAN PROPOSAL";
    doc.text(titleText, 105, 30, { align: "center" });
    
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    
    const jenisText = schedule.jenisUjian === 'munaqasyah' ? "Skripsi" : schedule.jenisUjian === 'hasil' ? "Seminar Hasil" : "Proposal";
    const statusText = schedule.jenisUjian === 'munaqasyah' ? "penelitian tugas akhir" : "penelitian tugas akhir"; // Simplified for other contexts

    const paragraph = `${jenisText} yang berjudul "${student.judul}" yang disusun oleh Saudari/Saudara ${student.nama}, Nim: ${student.nim} Mahasiswa Jurusan ${student.prodi} pada Fakultas Sains dan Teknologi Universitas Islam Negeri (UIN) Alauddin Makassar, telah diuji dan dipertahankan dalam ${jenisText} yang diselenggarakan pada tanggal ${schedule.tanggal}, dinyatakan telah disetujui untuk dilanjutkan dalam ${statusText}.`;
    
    const splitParagraph = doc.splitTextToSize(paragraph, 160);
    doc.text(splitParagraph, 25, 45, { align: "justify", maxWidth: 160, lineHeightFactor: 1.5 });
    
    let currentY = 45 + (splitParagraph.length * 6);
    
    // Date block aligned right
    currentY += 15;
    doc.text(`Samata, ${schedule.tanggal}`, 130, currentY);
    doc.line(125, currentY + 2, 190, currentY + 2); // Underline for date
    
    currentY += 15;
    doc.setFont("times", "bold");
    doc.text("DEWAN PENGUJI", 105, currentY, { align: "center" });
    
    currentY += 15;
    doc.setFont("times", "normal");
    
    const pengujiList = [
      { label: "Ketua", name: schedule.ketuaSidang || ".............................." },
      { label: "Sekretaris", name: schedule.sekretaris || ".............................." },
      { label: "Penguji I", name: schedule.penguji1 || ".............................." },
      { label: "Penguji II", name: schedule.penguji2 || ".............................." },
      { label: "Pembimbing I", name: student.pembimbing1 || ".............................." },
      { label: "Pembimbing II", name: student.pembimbing2 || ".............................." }
    ];
    
    pengujiList.forEach((p, idx) => {
      doc.text(p.label, 25, currentY);
      doc.text(":", 55, currentY);
      doc.text(p.name, 60, currentY);
      
      // Right side dots for signature
      doc.text("(............................)", 145, currentY);
      
      currentY += 10;
    });
    
    currentY += 15;
    
    // Diketahui Block
    doc.text("Diketahui", 130, currentY); currentY += 5;
    doc.text(`Ketua Jurusan ${student.prodi}`, 130, currentY); currentY += 5;
    doc.text("Fakultas Sains dan Teknologi", 130, currentY); currentY += 5;
    doc.text("UIN Alauddin Makassar", 130, currentY); currentY += 25;
    
    doc.text("..............................", 130, currentY); currentY += 5;
    doc.text("Nip. ..............................", 130, currentY);
    
    doc.save(`Lembar_Pengesahan_${student.nim}.pdf`);
  } catch (error) {
    console.error("PDF Generation Error: ", error);
    alert("Gagal membuat PDF: " + error.message);
  }
};

export const generateSKL = (student, schedule) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Add Watermark
    doc.setGState(new doc.GState({opacity: 0.1}));
    const logoSize = 120;
    doc.addImage(logoBase64, 'PNG', (210 - logoSize)/2, (297 - logoSize)/2, logoSize, logoSize);
    doc.setGState(new doc.GState({opacity: 1.0}));
    
    // Header
    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.text("UNIVERSITAS ISLAM NEGERI ALAUDDIN MAKASSAR", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text("FAKULTAS SAINS DAN TEKNOLOGI", 105, 28, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text(`Program Studi ${student.prodi}`, 105, 34, { align: "center" });
  
    doc.setLineWidth(1);
    doc.line(20, 38, 190, 38);
    doc.setLineWidth(0.3);
    doc.line(20, 39, 190, 39);
    
    // Title
    doc.setFontSize(16);
    doc.setFont("times", "bold");
    doc.text("SURAT KETERANGAN LULUS", 105, 55, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(65, 57, 145, 57);
    
    doc.setFontSize(11);
    doc.setFont("times", "normal");
    doc.text("Nomor: B-.../Un.06.1/FST/PP.00.9/06/2026", 105, 63, { align: "center" });
    
    doc.setFontSize(12);
    const intro = `Dekan Fakultas Sains dan Teknologi Universitas Islam Negeri Alauddin Makassar dengan ini menerangkan bahwa:`;
    const splitIntro = doc.splitTextToSize(intro, 160);
    doc.text(splitIntro, 25, 80);
    
    let currentY = 85 + splitIntro.length * 5;
    doc.text("Nama", 40, currentY); doc.text(`: ${student.nama}`, 75, currentY); currentY += 8;
    doc.text("NIM", 40, currentY); doc.text(`: ${student.nim}`, 75, currentY); currentY += 8;
    doc.text("Program Studi", 40, currentY); doc.text(`: ${student.prodi}`, 75, currentY); currentY += 8;
    
    currentY += 5;
    const tanggalText = schedule ? schedule.tanggal : '-';
    const p1 = `Telah menyelesaikan seluruh persyaratan akademik dan dinyatakan LULUS pada program strata satu (S1) pada tanggal ${tanggalText}. Oleh karena itu, yang bersangkutan berhak menyandang gelar Sarjana Komputer (S.Kom).`;
    const splitP1 = doc.splitTextToSize(p1, 160);
    doc.text(splitP1, 25, currentY, { align: "justify", lineHeightFactor: 1.5 });
    
    currentY += splitP1.length * 6 + 5;
    const p2 = `Surat Keterangan Lulus ini diberikan sebagai pengganti ijazah sementara sampai ijazah asli diterbitkan, dan dapat dipergunakan untuk keperluan sebagaimana mestinya.`;
    const splitP2 = doc.splitTextToSize(p2, 160);
    doc.text(splitP2, 25, currentY, { align: "justify", lineHeightFactor: 1.5 });
    
    currentY += splitP2.length * 6 + 15;
    
    const sigX = 150; // Center coordinate for the signature block on the right
    doc.text(`Samata, ${tanggalText}`, sigX, currentY, { align: "center" }); currentY += 6;
    doc.text("Dekan Fakultas Sains dan Teknologi,", sigX, currentY, { align: "center" }); currentY += 25;
    
    doc.setFont("times", "bold");
    doc.text("Ar. Fahmyddin A'raaf Tauhid, S.T., M.Arch., Ph.D., IAI", sigX, currentY, { align: "center" }); currentY += 5;
    doc.setFont("times", "normal");
    doc.text("NIP. 19700101 200003 1 001", sigX, currentY, { align: "center" });
    
    doc.save(`SKL_${student.nim}.pdf`);
  } catch (error) {
    console.error("PDF Generation Error: ", error);
    alert("Gagal membuat PDF SKL: " + error.message);
  }
};
