// backend/src/services/ChartService.ts
// 🔴 CORRIGIDO: Usa 'as any' para evitar conflito de tipos entre canvas e Chart.js

import { createCanvas } from 'canvas';
import Chart from 'chart.js/auto';
import { logger } from '../utils/logger.js';

export class ChartService {
  /**
   * Gera um gráfico de pizza como imagem PNG
   */
  static generatePieChart(
    data: Array<{ name: string; value: number; color: string }>,
    width: number = 500,
    height: number = 350
  ): Buffer {
    const canvas = createCanvas(width, height);
    // 🔴 CORREÇÃO: 'as any' para evitar conflito de tipos
    const ctx = canvas.getContext('2d') as any;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.color),
          borderColor: '#ffffff',
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 12 },
              color: '#1e293b',
              padding: 10,
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? Math.round((context.parsed / total) * 100) : 0;
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return canvas.toBuffer('image/png');
  }

  /**
   * Gera um gráfico de barras como imagem PNG
   */
  static generateBarChart(
    data: Array<{ name: string; value: number; color: string }>,
    width: number = 500,
    height: number = 350,
    title: string = 'Controles'
  ): Buffer {
    const canvas = createCanvas(width, height);
    // 🔴 CORREÇÃO: 'as any' para evitar conflito de tipos
    const ctx = canvas.getContext('2d') as any;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          label: title,
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.color),
          borderColor: data.map(d => d.color),
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { size: 12 },
              color: '#1e293b',
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#64748b',
            }
          },
          x: {
            ticks: {
              color: '#64748b',
            }
          }
        }
      }
    });

    return canvas.toBuffer('image/png');
  }

  /**
   * Gera um gráfico radar como imagem PNG
   */
  static generateRadarChart(
    data: Array<{ subject: string; Implementado: number; Recomendado: number }>,
    width: number = 600,
    height: number = 450
  ): Buffer {
    const canvas = createCanvas(width, height);
    // 🔴 CORREÇÃO: 'as any' para evitar conflito de tipos
    const ctx = canvas.getContext('2d') as any;

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: data.map(d => d.subject),
        datasets: [
          {
            label: 'Implementado',
            data: data.map(d => d.Implementado),
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#10b981',
            pointRadius: 4,
          },
          {
            label: 'Recomendado',
            data: data.map(d => d.Recomendado),
            backgroundColor: 'rgba(148, 163, 184, 0.1)',
            borderColor: '#94a3b8',
            borderDash: [6, 4],
            pointBackgroundColor: '#94a3b8',
            pointBorderColor: '#94a3b8',
            pointRadius: 3,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 12 },
              color: '#1e293b',
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              color: '#94a3b8',
            },
            pointLabels: {
              font: { size: 10 },
              color: '#334155',
            }
          }
        }
      }
    });

    return canvas.toBuffer('image/png');
  }
}