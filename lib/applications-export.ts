import { strToU8, zipSync } from 'fflate';

import type { ApplicationRecord } from '@/lib/applications-db';

const departmentLabels: Record<string, string> = {
  'vehicle-dynamics': 'Araç Dinamiği',
  'chassis-structures': 'Şasi ve Yapısal Sistemler',
  powertrain: 'Güç Aktarma Sistemleri',
  aerodynamics: 'Aerodinamik',
  'composites-manufacturing': 'Kompozitler ve Üretim',
  'electrical-electronics': 'Elektrik ve Elektronik',
  'sponsorship-partnerships': 'Sponsorluk ve İş Birlikleri',
  'media-communications': 'Medya ve İletişim',
  'finance-operations': 'Finans ve Operasyon',
};

const classLabels: Record<string, string> = {
  preparation: 'Hazırlık',
  '1': '1. sınıf',
  '2': '2. sınıf',
  '3': '3. sınıf',
  '4': '4. sınıf',
  graduate: 'Lisansüstü',
};

function escapeXml(value: string) {
  return value.replace(
    /[<>&"']/g,
    (character) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[character] ?? character,
  );
}

function cell(reference: string, value: string, style: number) {
  return `<c r="${reference}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function row(number: number, values: string[], style: number, height?: number) {
  const cells = values
    .map((value, index) =>
      cell(`${String.fromCharCode(65 + index)}${number}`, value, style),
    )
    .join('');
  return `<row r="${number}"${height ? ` ht="${height}" customHeight="1"` : ''}>${cells}</row>`;
}

export function buildAcceptedApplicationsWorkbook(
  applications: ApplicationRecord[],
  generatedAt = new Date(),
) {
  const lastRow = Math.max(4 + applications.length, 4);
  const titleCells = ['Kabul Edilen Takım Üyeleri', '', '', '', '', ''];
  const subtitleCells = [
    `${applications.length} kişi · ${generatedAt.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', dateStyle: 'long', timeStyle: 'short' })}`,
    '',
    '',
    '',
    '',
    '',
  ];
  const headers = [
    'Ad Soyad',
    'Telefon',
    'E-posta',
    'Sınıf',
    'Bölüm / Program',
    'Departman',
  ];
  const dataRows = applications
    .map((application, index) => {
      const department =
        application.assignedDepartment || application.primaryTeam;
      return row(
        5 + index,
        [
          application.name,
          application.phone,
          application.email,
          classLabels[application.classLevel] ?? application.classLevel,
          application.academicDepartment,
          departmentLabels[department] ?? department,
        ],
        index % 2 === 0 ? 3 : 4,
        24,
      );
    })
    .join('');

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:F${lastRow}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="20"/>
  <cols>
    <col min="1" max="1" width="28" customWidth="1"/>
    <col min="2" max="2" width="19" customWidth="1"/>
    <col min="3" max="3" width="34" customWidth="1"/>
    <col min="4" max="4" width="15" customWidth="1"/>
    <col min="5" max="5" width="34" customWidth="1"/>
    <col min="6" max="6" width="32" customWidth="1"/>
  </cols>
  <sheetData>
    ${row(1, titleCells, 1, 34)}
    ${row(2, subtitleCells, 5, 25)}
    ${row(4, headers, 2, 27)}
    ${dataRows}
  </sheetData>
  <autoFilter ref="A4:F${lastRow}"/>
  <mergeCells count="2"><mergeCell ref="A1:F1"/><mergeCell ref="A2:F2"/></mergeCells>
  <pageMargins left="0.35" right="0.35" top="0.6" bottom="0.6" header="0.2" footer="0.2"/>
  <pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><name val="Aptos"/><family val="2"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="18"/><name val="Aptos Display"/></font>
    <font><b/><color rgb="FF03110D"/><sz val="11"/><name val="Aptos"/></font>
    <font><i/><color rgb="FF789087"/><sz val="10"/><name val="Aptos"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF041A12"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF00E27B"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE7F8EF"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"><color rgb="FFD4E5DC"/></left><right style="thin"><color rgb="FFD4E5DC"/></right><top style="thin"><color rgb="FFD4E5DC"/></top><bottom style="thin"><color rgb="FFD4E5DC"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"><alignment vertical="center"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  const isoDate = generatedAt.toISOString();
  const files = {
    '[Content_Types].xml': strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`,
    ),
    '_rels/.rels': strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`,
    ),
    'docProps/app.xml': strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>SAUFormula</Application></Properties>`,
    ),
    'docProps/core.xml': strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>SAUFormula Kabul Edilen Takım Üyeleri</dc:title><dc:creator>SAUFormula</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${isoDate}</dcterms:created></cp:coreProperties>`,
    ),
    'xl/workbook.xml': strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Kabul Edilenler" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="191029"/></workbook>`,
    ),
    'xl/_rels/workbook.xml.rels': strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    ),
    'xl/styles.xml': strToU8(styles),
    'xl/worksheets/sheet1.xml': strToU8(sheet),
  };

  return zipSync(files, { level: 6 });
}
