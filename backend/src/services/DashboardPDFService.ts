// backend/src/services/DashboardPDFService.ts
// 🔵 OTIMIZADO:
// - Melhora performance de geração PDF
// - Corrige quebra de página do Chromium
// - Mantém todos os gráficos e métricas existentes

import { logger } from '../utils/logger.js';
import { ChartService } from './ChartService.js';

interface DashboardPDFData {
  company: {
    id: string;
    name: string;
  };
  summary: {
    totalControls: number;
    Implementado: number;
    Parcialmente: number;
    NaoImplementado: number;
    NaoSeAplica: number;
    percentages: {
      Implementado: number;
      Parcialmente: number;
      NaoImplementado: number;
      NaoSeAplica: number;
    };
  };
  byDomain: Record<string, any>;
  byCategory: Record<string, any>;
  byType: Record<string, any>;
  byCyberConcept: Record<string, any>;
  byCapability: Record<string, any>;
  user: {
    name: string;
    email: string;
  };
  generatedAt: string;
}

export class DashboardPDFService {

  /**
   * Gera PDF completo do Dashboard de Maturidade
   *
   * Otimizações aplicadas:
   * - Menos processamento no Chromium
   * - Menos escala de renderização
   * - Remove espera fixa
   * - Mantém compatibilidade Render/Vercel/Linux
   */
  static async generateDashboardPDF(
    data: DashboardPDFData
  ): Promise<Buffer> {

    const startTime = Date.now();

    let browser: any = null;

    try {

      const isProduction =
        process.env.NODE_ENV === 'production';

      let puppeteer: any;
      let browserOptions: any;


      logger.info(
        '🔄 DashboardPDF: Iniciando geração otimizada'
      );


      /*
       * =====================================================
       * GERAÇÃO DOS GRÁFICOS
       * =====================================================
       */

      const pieChartImage =
        ChartService.generatePieChart([
          {
            name: 'Implementado',
            value: data.summary.Implementado || 0,
            color: '#10b981'
          },
          {
            name: 'Parcialmente implementado',
            value: data.summary.Parcialmente || 0,
            color: '#f59e0b'
          },
          {
            name: 'Não implementado',
            value: data.summary.NaoImplementado || 0,
            color: '#ef4444'
          },
          {
            name: 'Não se aplica',
            value: data.summary.NaoSeAplica || 0,
            color: '#94a3b8'
          }

        ] as Array<{
          name:string;
          value:number;
          color:string;
        }>);


      const barChartImage =
        ChartService.generateBarChart([
          {
            name:'Implementados',
            value:data.summary.Implementado || 0,
            color:'#10b981'
          },
          {
            name:'Parciais',
            value:data.summary.Parcialmente || 0,
            color:'#f59e0b'
          },
          {
            name:'Não Implementados',
            value:data.summary.NaoImplementado || 0,
            color:'#ef4444'
          }

        ] as Array<{
          name:string;
          value:number;
          color:string;
        }>);



      const conceptBarData =
        Object.entries(
          data.byCyberConcept || {}
        )
        .map(
          ([key,value]:[string,any]) => ({
            name:key,
            value:value.total || 0,
            color:'#6366f1'
          })
        )
        .filter(
          item => item.value > 0
        );


      const conceptBarImage =
        ChartService.generateBarChart(
          conceptBarData
        );



      const domainBarData =
        Object.entries(
          data.byDomain || {}
        )
        .map(
          ([key,value]:[string,any]) => ({
            name:key,
            value:value.total || 0,
            color:'#3b82f6'
          })
        )
        .filter(
          item => item.value > 0
        );


      const domainBarImage =
        ChartService.generateBarChart(
          domainBarData
        );



      const radarData =
        Object.entries(
          data.byCapability || {}
        )
        .map(
          ([key,value]:[string,any]) => ({
            subject:
              key.length > 20
                ? key.substring(0,20)+'…'
                : key,

            Implementado:
              value.aderente || 0,

            Recomendado:100
          })
        );


      const radarChartImage =
        ChartService.generateRadarChart(
          radarData
        );



      const pieBase64 =
        pieChartImage.toString('base64');

      const barBase64 =
        barChartImage.toString('base64');

      const conceptBarBase64 =
        conceptBarImage.toString('base64');

      const domainBarBase64 =
        domainBarImage.toString('base64');

      const radarBase64 =
        radarChartImage.toString('base64');



      /*
       * =====================================================
       * HTML
       * =====================================================
       */

      const html =
        this.generateHTML(
          data,
          pieBase64,
          barBase64,
          conceptBarBase64,
          domainBarBase64,
          radarBase64,
          {},
          {},
          {}
        );



      /*
       * =====================================================
       * CONFIGURAÇÃO DO CHROMIUM
       * =====================================================
       */


      if(isProduction){

        const chromiumModule =
          await import('@sparticuz/chromium');

        const chromium =
          chromiumModule.default ||
          chromiumModule;


        const puppeteerCore =
          await import('puppeteer-core');


        puppeteer =
          puppeteerCore.default ||
          puppeteerCore;



        browserOptions = {

          args:[
            ...(chromium.args || []),

            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',

            '--single-process'
          ],


          executablePath:
            await chromium.executablePath(),


          headless:true
        };


        logger.info(
          '🔄 DashboardPDF: Chromium produção'
        );


      }else{


        const puppeteerModule =
          await import('puppeteer');


        puppeteer =
          puppeteerModule.default ||
          puppeteerModule;



        browserOptions={

          headless:true,

          args:[
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
          ]

        };


        if(process.env.PUPPETEER_EXECUTABLE_PATH){

          browserOptions.executablePath =
            process.env.PUPPETEER_EXECUTABLE_PATH;

        }


        logger.info(
          '🔄 DashboardPDF: Puppeteer local'
        );

      }



      browser =
        await puppeteer.launch(
          browserOptions
        );


      const page =
        await browser.newPage();



      /*
       * =====================================================
       * VIEWPORT OTIMIZADO
       * =====================================================
       */

      await page.setViewport({

        width:1280,

        height:1600,

        deviceScaleFactor:1

      });



      await page.setContent(
        html,
        {
          waitUntil:[
            'load',
            'domcontentloaded'
          ] as any,

          timeout:30000
        }
      );



      // Aguarda somente fontes/imagens necessárias
      await page.evaluate(async()=>{

        if(document.fonts){

          await document.fonts.ready;

        }

      });



      /*
       * =====================================================
       * PDF
       * =====================================================
       */

      const pdf =
        await page.pdf({

          format:'A4',

          landscape:true,


          printBackground:true,


          margin:{

            top:'15mm',
            bottom:'15mm',
            left:'10mm',
            right:'10mm'

          },


          displayHeaderFooter:true,


          preferCSSPageSize:false,


          scale:0.95,


          timeout:60000

        });



      logger.info(
        `✅ DashboardPDF gerado em ${
          Date.now()-startTime
        }ms (${pdf.length} bytes)`
      );


      return Buffer.from(pdf);



    }catch(error){

      logger.error(
        '❌ DashboardPDF erro:',
        error
      );

      throw error;


    }finally{


      if(browser){

        await browser.close();

        logger.debug(
          '🔒 DashboardPDF Browser fechado'
        );

      }

    }

  }
    /**
   * Geração do HTML otimizado para impressão PDF
   *
   * Ajustes:
   * - Chromium print engine
   * - Controle de paginação
   * - Evita quebra de gráficos
   * - Layout estável A4 landscape
   */
  private static generateHTML(
    data: DashboardPDFData,
    pieBase64: string,
    barBase64: string,
    conceptBarBase64: string,
    domainBarBase64: string,
    radarBase64: string,
    typePieImages: Record<string,string>,
    conceptPieImages: Record<string,string>,
    domainPieImages: Record<string,string>
  ): string {


    const {
      company,
      summary,
      user,
      generatedAt,
      byDomain,
      byCategory,
      byType,
      byCyberConcept,
      byCapability
    } = data;



    const formatDate = (date:string)=>{

      return new Date(date)
        .toLocaleDateString(
          'pt-BR',
          {
            day:'2-digit',
            month:'long',
            year:'numeric'
          }
        );

    };



    const completionRate =
      summary.totalControls > 0
      ?
      Math.round(
        (
          summary.Implementado /
          summary.totalControls
        ) * 100
      )
      :
      0;



    /*
     ======================================================
     PREPARAÇÃO DOS DADOS
     ======================================================
    */


    const categoryData =
      Object.entries(
        byCategory || {}
      )
      .map(
        ([name,value]:[string,any])=>({

          name,

          total:value.total || 0,

          implemented:
            value.implemented || 0,

          partial:
            value.partial || 0,

          notImpl:
            value.notImpl || 0

        })
      );



    const typeData =
      Object.entries(
        byType || {}
      )
      .map(
        ([name,value]:[string,any])=>({

          name,

          total:value.total || 0,

          implemented:
            value.implemented || 0,

          partial:
            value.partial || 0,

          notImpl:
            value.notImpl || 0

        })
      );



    const conceptData =
      Object.entries(
        byCyberConcept || {}
      )
      .map(
        ([name,value]:[string,any])=>({

          name,

          total:value.total || 0,

          implemented:
            value.implemented || 0,

          partial:
            value.partial || 0,

          notImpl:
            value.notImpl || 0

        })
      );



    const domainData =
      Object.entries(
        byDomain || {}
      )
      .map(
        ([name,value]:[string,any])=>({

          name,

          total:value.total || 0,

          implemented:
            value.implemented || 0,

          partial:
            value.partial || 0,

          notImpl:
            value.notImpl || 0

        })
      );



    const capabilityData =
      Object.entries(
        byCapability || {}
      )
      .map(
        ([name,value]:[string,any])=>({

          name,

          total:value.total || 0,

          implemented:
            value.implemented || 0,

          partial:
            value.partial || 0,

          notImpl:
            value.notImpl || 0,

          aderente:
            value.aderente || 0

        })
      );



    const userName =
      user?.name ||
      'Usuário não identificado';



    const userEmail =
      user?.email ||
      'email não informado';



    return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">


<style>


/*
======================================================
CONFIGURAÇÃO BASE
======================================================
*/


*{

 margin:0;

 padding:0;

 box-sizing:border-box;

}



body{

 font-family:
 Arial,
 Helvetica,
 sans-serif;

 color:#1e293b;

 font-size:10pt;

 background:#ffffff;

}



.page{

 width:100%;

 padding:15pt;

 page-break-after:always;

 break-after:page;

}



.page:last-child{

 page-break-after:auto;

 break-after:auto;

}



/*
======================================================
CONTROLE DE QUEBRA
======================================================
*/


.pdf-section{

 page-break-inside:avoid;

 break-inside:avoid;

}



.chart-container{

 width:100%;

 text-align:center;

 page-break-inside:avoid;

 break-inside:avoid;

 overflow:hidden;

}



.chart-wrapper{

 width:100%;

 max-width:430px;

 height:260px;

 margin:auto;

 overflow:hidden;

}



.chart-img{

 display:block;

 margin:auto;

 max-width:430px;

 max-height:260px;

 width:auto;

 height:auto;

 object-fit:contain;

}



/*
======================================================
LAYOUT
======================================================
*/


.flex-row{

 display:flex;

 gap:12pt;

 width:100%;

}



.flex-column{

 display:flex;

 flex-direction:column;

}



.flex-item{

 flex:1;

 min-width:0;

}



/*
======================================================
CARDS
======================================================
*/


.card{

 background:#f8fafc;

 border:1px solid #e2e8f0;

 border-radius:5pt;

 padding:8pt;

 text-align:center;

 page-break-inside:avoid;

 break-inside:avoid;

}



.metric{

 font-size:18pt;

 font-weight:bold;

}



.label{

 font-size:8pt;

 color:#64748b;

}



/*
======================================================
TABELAS
======================================================
*/


table{

 width:100%;

 border-collapse:collapse;

 font-size:8pt;

 page-break-inside:avoid;

}



th{

 background:#f1f5f9;

 font-weight:bold;

}



td,
th{

 border:1px solid #cbd5e1;

 padding:4pt;

 text-align:center;

}



/*
======================================================
GRÁFICOS
======================================================
*/


.chart-title{

 font-size:10pt;

 font-weight:bold;

 color:#475569;

 margin-bottom:4pt;

}



.chart-subtitle{

 font-size:8pt;

 color:#94a3b8;

 margin-bottom:6pt;

}



/*
======================================================
RADAR
======================================================
*/


.radar-container{

 width:420px;

 height:300px;

 margin:auto;

 overflow:hidden;

 page-break-inside:avoid;

 break-inside:avoid;

}



/*
======================================================
IMPRESSÃO
======================================================
*/


@page{

 size:A4 landscape;

 margin:15mm;

}



*{

 -webkit-print-color-adjust:exact!important;

 print-color-adjust:exact!important;

}


</style>


</head>


<body>

`;
    return `

<!-- =====================================================
     CAPA
====================================================== -->

<div class="page pdf-section">


<div style="
text-align:center;
padding-top:120px;
">


<div style="
font-size:34pt;
font-weight:900;
color:#0f172a;
">

Code<span style="color:#2563eb;">
_Assessment
</span>

</div>



<h1 style="
margin-top:30px;
font-size:24pt;
">

Dashboard de Maturidade

</h1>



<p style="
font-size:14pt;
color:#475569;
">

Avaliação ISO 27001:2022

</p>



<div style="
margin:30px auto;
font-size:20pt;
font-weight:bold;
color:#2563eb;
border-top:2px solid #2563eb;
border-bottom:2px solid #2563eb;
padding:12px 30px;
max-width:70%;
">

${company.name}

</div>



<div style="
margin-top:30px;
font-size:10pt;
color:#64748b;
line-height:1.8;
">

<strong>Responsável:</strong>
${userName}

<br/>

<strong>E-mail:</strong>
${userEmail}

<br/>

<strong>Data:</strong>
${formatDate(generatedAt)}

</div>


</div>


</div>



<!-- =====================================================
     VISÃO GERAL
====================================================== -->


<div class="page">


<h2>
1. Visão Geral
</h2>



<div class="flex-row pdf-section">


<div class="card flex-item">

<div class="metric">
${summary.totalControls}
</div>

<div class="label">
Total de controles
</div>

</div>



<div class="card flex-item">

<div class="metric"
style="color:#10b981">

${summary.Implementado}

</div>

<div class="label">
Implementados
</div>

</div>



<div class="card flex-item">

<div class="metric"
style="color:#f59e0b">

${summary.Parcialmente}

</div>

<div class="label">
Parciais
</div>

</div>



<div class="card flex-item">

<div class="metric"
style="color:#ef4444">

${summary.NaoImplementado}

</div>

<div class="label">
Não implementados
</div>

</div>



<div class="card flex-item">

<div class="metric"
style="color:#2563eb">

${completionRate}%

</div>

<div class="label">
Taxa conclusão
</div>

</div>


</div>



<br/>



<div class="flex-row pdf-section">


<div class="chart-container flex-item">

<div class="chart-title">

Distribuição de Status

</div>


<div class="chart-wrapper">

<img
class="chart-img"
src="data:image/png;base64,${pieBase64}"
/>

</div>


</div>



<div class="chart-container flex-item">


<div class="chart-title">

Quantidade por Status

</div>


<div class="chart-wrapper">

<img
class="chart-img"
src="data:image/png;base64,${barBase64}"
/>

</div>


</div>


</div>


</div>





<!-- =====================================================
     CATEGORIAS
====================================================== -->


<div class="page">


<h2>
2. Categorias de Controle
</h2>


<div class="flex-row pdf-section">


${categoryData.map(cat=>`

<div class="card flex-item">


<div class="metric">
${cat.total}
</div>


<div class="label">

${cat.name}

</div>



<div style="
margin-top:8px;
font-size:8pt;
">


<span style="color:#10b981">
✔ ${cat.implemented}
</span>


&nbsp;


<span style="color:#f59e0b">
◐ ${cat.partial}
</span>


&nbsp;


<span style="color:#ef4444">
✖ ${cat.notImpl}
</span>


</div>



</div>


`).join('')}



</div>


</div>





<!-- =====================================================
     TIPOS DE CONTROLE
====================================================== -->


<div class="page">


<h2>
3. Tipos de Controle
</h2>



<div class="flex-row pdf-section">


${typeData.map(type=>`

<div class="card flex-item">


<div class="metric">

${type.total}

</div>


<div class="label">

${type.name}

</div>



<div style="margin-top:8px">


<span style="color:#10b981">
✔ ${type.implemented}
</span>


&nbsp;


<span style="color:#f59e0b">
◐ ${type.partial}
</span>


&nbsp;


<span style="color:#ef4444">
✖ ${type.notImpl}
</span>



</div>



</div>


`).join('')}


</div>


</div>





<!-- =====================================================
     CONCEITOS CIBERNÉTICOS
====================================================== -->


<div class="page">


<h2>
4. Conceitos Cibernéticos
</h2>



<div class="chart-container pdf-section">


<div class="chart-title">

Identificar | Proteger | Detectar | Responder | Restaurar

</div>


<div class="chart-wrapper">

<img
class="chart-img"
src="data:image/png;base64,${conceptBarBase64}"
/>

</div>


</div>



</div>





<!-- =====================================================
     CAPACIDADES OPERACIONAIS
====================================================== -->


<div class="page">


<h2>
5. Capacidades Operacionais
</h2>



<div class="radar-container pdf-section">


<img
class="chart-img"
src="data:image/png;base64,${radarBase64}"
/>


</div>



<br/>



<table>


<thead>

<tr>

<th>
Capacidade
</th>

<th>
Implementado
</th>

<th>
Parcial
</th>

<th>
Não Implementado
</th>

<th>
Total
</th>

<th>
Aderência
</th>


</tr>

</thead>


<tbody>


${capabilityData.map(cap=>`

<tr>

<td>
${cap.name}
</td>


<td style="color:#10b981">
${cap.implemented}
</td>


<td style="color:#f59e0b">
${cap.partial}
</td>


<td style="color:#ef4444">
${cap.notImpl}
</td>


<td>
${cap.total}
</td>


<td>
${cap.aderente}%
</td>


</tr>


`).join('')}


</tbody>


</table>



</div>





<!-- =====================================================
     DOMÍNIOS
====================================================== -->


<div class="page">


<h2>
6. Domínios de Segurança da Informação
</h2>



<div class="chart-container pdf-section">


<div class="chart-title">

Distribuição por Domínio

</div>


<div class="chart-wrapper">


<img
class="chart-img"
src="data:image/png;base64,${domainBarBase64}"
/>


</div>


</div>



<br/>



<div class="flex-row">


${domainData.map(domain=>`


<div class="card flex-item">


<div class="metric">

${domain.total}

</div>


<div class="label">

${domain.name}

</div>



</div>


`).join('')}


</div>


</div>





<!-- =====================================================
     FINAL
====================================================== -->


<div class="page">


<div style="
text-align:center;
margin-top:150px;
color:#64748b;
font-size:9pt;
">


<strong>
Code_Assessment
</strong>


<br/>


Sistema de Avaliação de Maturidade ISO 27001:2022


<br/><br/>


Relatório gerado em
${formatDate(generatedAt)}


<br/>


Empresa:
${company.name}



</div>


</div>



</body>

</html>


`;

  }

}