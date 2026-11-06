/*!
 * core.js — Lõi tính toán app "Tính cống theo TCVN 9845:2013"
 * © TS. Đặng Minh Tân — Bộ môn Đường bộ – Sân bay, Khoa Công trình và Môi trường,
 *   Trường Đại học Giao thông Vận tải. Dùng cho giảng dạy và nghiên cứu.
 *
 * Nội dung:
 *  1) Bảng tra TCVN 9845:2013 (Bảng 1, 3, 4, 5, 6, 10, A.1, A.2, A.3) — trích từ văn bản gốc.
 *  2) Thủy văn: công thức cường độ giới hạn (1), (8), (9), (10).
 *  3) Thủy lực cống theo Phụ lục D: các toán đồ D.1–D.8 (FHWA HDS-5, Herr 1977) được thay bằng
 *     chính các phương trình hồi quy dựng nên toán đồ (HDS-5 Table A.1) — kiểm soát cửa vào —
 *     và phương trình năng lượng dòng chảy đầy — kiểm soát cửa ra.
 */
(function (root) {
  'use strict';

  /* ======================= 0. NGÔN NGỮ ======================= */
  let LANG = 'vi';
  const tr = (vi, en) => (LANG === 'en' ? en : vi);
  function setLang(l) { LANG = l === 'en' ? 'en' : 'vi'; }

  /* ======================= 1. DỮ LIỆU BẢNG TRA ======================= */
  const RAW = {"A1":{"II":{"H":["<100","101-150","151-200","201-250","251-300","301-400",">400"],"phi":[[0.96,0.94,0.93,0.9,0.88,0.85,0.81,0.78,0.76,0.74,0.67,0.65,0.6],[0.97,0.96,0.94,0.91,0.9,0.87,0.85,0.78,0.76,0.74,0.67,0.65,0.6],[0.97,0.96,0.95,0.93,0.92,0.9,0.89,0.85,0.83,0.81,0.75,0.73,0.7],[0.97,0.96,0.96,0.95,0.94,0.93,0.92,0.89,0.89,0.85,0.85,0.85,0.85],[0.97,0.96,0.96,0.96,0.95,0.95,0.94,0.93,0.93,0.88,0.88,0.88,0.86],[0.97,0.96,0.96,0.96,0.95,0.95,0.95,0.93,0.93,0.91,0.91,0.91,0.91],[0.97,0.96,0.96,0.96,0.95,0.95,0.95,0.93,0.93,0.91,0.91,0.91,0.91]]},"III":{"H":["<100","101-150","151-200","201-250","251-300","301-350","351-400","401-450","451-500","501-550","551-600",">600"],"phi":[[0.94,0.89,0.86,0.8,0.77,0.74,0.65,0.6,0.58,0.55,0.53,0.53,0.5],[0.95,0.93,0.9,0.85,0.81,0.77,0.72,0.63,0.62,0.6,0.55,0.55,0.55],[0.95,0.93,0.91,0.88,0.86,0.82,0.79,0.72,0.68,0.68,0.63,0.63,0.62],[0.95,0.93,0.92,0.91,0.9,0.85,0.85,0.75,0.72,0.73,0.73,0.73,0.65],[0.95,0.93,0.921,0.91,0.9,0.85,0.85,0.77,0.74,0.74,0.69,0.69,0.67],[0.95,0.93,0.921,0.912,0.9,0.855,0.87,0.78,0.76,0.75,0.71,0.71,0.69],[0.95,0.93,0.922,0.912,0.902,0.88,0.89,0.79,0.77,0.77,0.73,0.73,0.7],[0.95,0.93,0.922,0.913,0.902,0.885,0.895,0.8,0.79,0.78,0.75,0.75,0.71],[0.95,0.93,0.923,0.913,0.91,0.89,0.94,0.8,0.8,0.79,0.75,0.75,0.71],[0.95,0.93,0.923,0.913,0.91,0.89,0.94,0.8,0.8,0.8,0.76,0.76,0.71],[0.95,0.93,0.923,0.913,0.91,0.89,0.94,0.8,0.8,0.8,0.76,0.76,0.71],[0.95,0.93,0.923,0.913,0.91,0.89,0.94,0.8,0.8,0.8,0.76,0.76,0.71]]},"IV":{"H":["<100","101-150","151-200","201-250","251-300","301-350","351-400","401-450","451-500","501-550","551-600",">600"],"phi":[[0.9,0.81,0.76,0.66,0.65,0.6,0.55,0.51,0.5,0.5,0.44,0.4,0.37],[0.9,0.84,0.8,0.76,0.68,0.64,0.62,0.58,0.56,0.55,0.52,0.5,0.46],[0.9,0.88,0.85,0.82,0.78,0.75,0.72,0.66,0.63,0.6,0.6,0.57,0.55],[0.9,0.88,0.822,0.823,0.79,0.78,0.74,0.7,0.67,0.67,0.65,0.6,0.58],[0.9,0.88,0.822,0.825,0.79,0.79,0.76,0.74,0.7,0.7,0.69,0.65,0.61],[0.9,0.88,0.828,0.828,0.8,0.8,0.78,0.76,0.72,0.71,0.71,0.67,0.64],[0.9,0.88,0.828,0.83,0.82,0.82,0.81,0.77,0.74,0.73,0.72,0.69,0.65],[0.9,0.88,0.86,0.84,0.84,0.84,0.83,0.77,0.75,0.75,0.73,0.71,0.67],[0.9,0.88,0.86,0.85,0.84,0.84,0.83,0.78,0.76,0.77,0.73,0.72,0.68],[0.9,0.88,0.87,0.86,0.84,0.84,0.83,0.78,0.76,0.77,0.73,0.72,0.69],[0.9,0.88,0.87,0.86,0.84,0.84,0.83,0.78,0.76,0.77,0.73,0.72,0.69],[0.9,0.88,0.87,0.86,0.84,0.84,0.83,0.78,0.76,0.77,0.73,0.72,0.69]]},"V":{"H":["<100","101-150","151-200","201-250","251-300","301-350","351-400","401-450","451-500","501-550","551-600",">600"],"phi":[[0.68,0.46,0.35,0.26,0.24,0.22,0.22,0.2,0.18,0.18,0.17,0.16,0.15],[0.71,0.56,0.46,0.41,0.4,0.34,0.32,0.28,0.27,0.25,0.23,0.22,0.2],[0.75,0.65,0.59,0.5,0.48,0.46,0.46,0.42,0.45,0.38,0.34,0.32,0.3],[0.76,0.68,0.63,0.543,0.5,0.5,0.5,0.46,0.49,0.43,0.38,0.36,0.34],[0.77,0.71,0.66,0.58,0.58,0.54,0.54,0.49,0.51,0.46,0.41,0.4,0.36],[0.77,0.73,0.66,0.58,0.58,0.54,0.56,0.49,0.54,0.46,0.41,0.43,0.37],[0.78,0.75,0.7,0.65,0.64,0.57,0.57,0.53,0.55,0.52,0.46,0.46,0.4],[0.79,0.76,0.72,0.67,0.67,0.58,0.58,0.54,0.55,0.53,0.47,0.47,0.41],[0.79,0.77,0.73,0.68,0.68,0.6,0.6,0.55,0.55,0.53,0.48,0.48,0.41],[0.79,0.78,0.73,0.7,0.7,0.6,0.6,0.55,0.55,0.53,0.49,0.5,0.41],[0.79,0.78,0.73,0.7,0.7,0.6,0.6,0.55,0.55,0.53,0.5,0.5,0.41],[0.79,0.78,0.73,0.7,0.7,0.6,0.6,0.55,0.55,0.53,0.5,0.5,0.41]]},"VI":{"H":[null],"phi":[[null,null,0.25,null,null,null,0.2,null,0.15,null,0.1,null,0.1]]}},"A2":{"phi":[1.0,1.5,2.0,2.5,3.0,4.0,5.0,6.0,7.0,8.0,9.0,10.0,12.0,15.0,17.0,20.0,25.0,30.0,35.0,40.0],"tau":{"I":[9.6,10.0,17.0,24.0,35.0,40.0,53.0,62.0,70.0,75.0,80.0,90.0,100.0,130.0,160.0,200.0,260.0,325.0,370.0,470.0],"II":[9.7,10.0,15.0,22.0,28.0,37.0,45.0,60.0,70.0,78.0,87.0,95.0,115.0,150.0,165.0,220.0,280.0,360.0,430.0,530.0],"III":[9.7,10.0,17.0,20.0,25.0,32.0,50.0,60.0,72.0,80.0,90.0,100.0,120.0,150.0,180.0,230.0,265.0,365.0,435.0,520.0],"IV":[9.0,9.0,9.5,10.0,18.0,22.0,30.0,45.0,60.0,68.0,80.0,86.0,95.0,120.0,165.0,200.0,235.0,320.0,400.0,470.0],"V":[9.6,10.0,14.0,20.0,30.0,35.0,44.0,60.0,75.0,85.0,90.0,95.0,100.0,120.0,170.0,200.0,260.0,320.0,370.0,480.0],"VI":[9.6,10.0,10.0,15.0,22.0,30.0,38.0,50.0,70.0,78.0,82.0,88.0,93.0,120.0,150.0,185.0,230.0,310.0,370.0,470.0],"VII":[16.0,18.0,25.0,32.0,37.0,42.0,50.0,55.0,65.0,75.0,85.0,90.0,100.0,125.0,165.0,205.0,250.0,320.0,400.0,570.0],"VIII":[8.4,8.5,9.0,10.0,20.0,30.0,40.0,55.0,65.0,70.0,80.0,90.0,115.0,135.0,190.0,235.0,305.0,370.0,480.0,495.0],"IX":[9.7,10.0,13.0,15.0,18.0,25.0,30.0,40.0,65.0,70.0,80.0,95.0,115.0,135.0,170.0,220.0,290.0,370.0,430.0,520.0],"X":[9.8,10.0,15.0,18.0,25.0,40.0,45.0,60.0,75.0,85.0,90.0,95.0,110.0,135.0,170.0,220.0,265.0,335.0,345.0,410.0],"XI":[9.5,10.0,20.0,28.0,35.0,55.0,65.0,72.0,80.0,90.0,95.0,110.0,130.0,160.0,200.0,230.0,300.0,400.0,470.0,560.0],"XII":[10.0,13.0,20.0,23.0,30.0,35.0,50.0,60.0,75.0,80.0,87.0,105.0,120.0,150.0,190.0,235.0,300.0,380.0,450.0,540.0],"XIII":[9.8,10.0,15.0,20.0,25.0,30.0,40.0,55.0,65.0,70.0,82.0,90.0,100.0,125.0,160.0,200.0,250.0,330.0,400.0,510.0],"XIV":[8.7,9.0,9.3,9.5,11.0,20.0,30.0,35.0,50.0,70.0,80.0,85.0,90.0,115.0,160.0,200.0,250.0,320.0,400.0,480.0],"XV":[8.5,8.7,9.3,9.5,10.0,20.0,25.0,32.0,50.0,65.0,70.0,80.0,90.0,125.0,150.0,190.0,250.0,320.0,400.0,490.0],"XVI":[8.7,9.0,9.5,9.6,12.0,20.0,30.0,37.0,50.0,65.0,78.0,80.0,90.0,115.0,140.0,175.0,225.0,285.0,355.0,425.0],"XVII":[9.3,9.4,9.7,10.0,20.0,25.0,35.0,40.0,60.0,70.0,80.0,90.0,97.0,120.0,145.0,190.0,240.0,320.0,380.0,465.0],"XVIII":[9.2,9.3,9.5,9.7,12.0,20.0,23.0,30.0,40.0,60.0,70.0,80.0,83.0,100.0,130.0,165.0,230.0,300.0,370.0,null]}},"A3":{"tau":[20,30,60,90,180],"phils":[0,1,5,10,20,30,40,50,60,70,80,90,100,150,200,220],"A":{"I":[[0.28,0.26,0.218,0.152,0.112,0.092,0.076,0.064,0.054,0.047,0.04,0.035,0.03,0.018,0.015,0.013],[0.21,0.19,0.16,0.136,0.104,0.085,0.072,0.061,0.052,0.045,0.038,0.033,0.029,0.017,0.014,0.0125],[0.15,0.143,0.125,0.111,0.091,0.076,0.065,0.055,0.047,0.04,0.034,0.03,0.026,0.016,0.013,0.012],[0.114,0.112,0.102,0.093,0.077,0.065,0.056,0.048,0.041,0.035,0.031,0.027,0.024,0.015,0.012,0.0115],[0.072,0.071,0.067,0.063,0.055,0.048,0.043,0.037,0.033,0.029,0.025,0.022,0.021,0.014,0.0115,0.011]],"II":[[0.117,0.114,0.104,0.093,0.087,0.065,0.055,0.047,0.04,0.034,0.03,0.026,0.024,0.018,0.015,0.014],[0.1,0.098,0.091,0.083,0.07,0.06,0.052,0.044,0.038,0.033,0.028,0.025,0.023,0.0175,0.014,0.013],[0.082,0.081,0.076,0.07,0.06,0.052,0.045,0.039,0.034,0.03,0.027,0.024,0.022,0.016,0.013,0.0125],[0.067,0.066,0.063,0.059,0.052,0.046,0.04,0.035,0.031,0.027,0.025,0.022,0.02,0.015,0.012,0.012],[0.052,0.051,0.048,0.046,0.041,0.036,0.032,0.028,0.025,0.022,0.02,0.018,0.017,0.014,0.011,0.011]],"III":[[0.159,0.153,0.137,0.112,0.0985,0.0831,0.0708,0.0618,0.0544,0.0492,0.045,0.041,0.0378,0.0281,0.0218,0.0183],[0.132,0.129,0.116,0.104,0.0866,0.074,0.065,0.0573,0.0507,0.0462,0.042,0.039,0.0358,0.0272,0.0211,0.018],[0.095,0.092,0.087,0.079,0.0695,0.0611,0.053,0.0497,0.0447,0.041,0.038,0.035,0.0325,0.0252,0.0197,0.017],[0.073,0.068,0.0659,0.0612,0.0549,0.05,0.0443,0.0414,0.0384,0.0355,0.033,0.0307,0.0292,0.0228,0.0185,0.016],[0.058,0.054,0.0517,0.049,0.045,0.042,0.0383,0.036,0.033,0.0303,0.03,0.0268,0.0256,0.0205,0.0165,0.015]],"IV":[[0.273,0.214,0.188,0.163,0.128,0.104,0.0865,0.0743,0.0654,0.0565,0.0499,0.0448,0.0408,0.0279,0.0216,0.0184],[0.2,0.184,0.163,0.142,0.1153,0.095,0.0816,0.0703,0.0615,0.0545,0.0479,0.0429,0.039,0.0269,0.0212,0.0182],[0.129,0.124,0.117,0.107,0.0903,0.079,0.0688,0.0593,0.0553,0.0473,0.0427,0.0382,0.0351,0.0256,0.02,0.0174],[0.102,0.093,0.089,0.084,0.0735,0.0645,0.0579,0.0508,0.046,0.041,0.037,0.034,0.0315,0.023,0.0189,0.0164],[0.072,0.071,0.067,0.063,0.0555,0.0503,0.0456,0.0413,0.0378,0.0328,0.0315,0.031,0.0275,0.021,0.0178,0.0155]],"V":[[0.12,0.1185,0.1115,0.1087,0.094,0.0786,0.069,0.063,0.0525,0.0457,0.0397,0.0347,0.0304,0.0195,0.014,0.013],[0.112,0.11,0.1035,0.0965,0.084,0.0733,0.0638,0.056,0.0485,0.0423,0.037,0.032,0.028,0.0169,0.0133,0.0124],[0.098,0.0965,0.0855,0.0815,0.0748,0.0655,0.0577,0.0506,0.0445,0.0393,0.0345,0.0304,0.0268,0.0163,0.0126,0.0119],[0.083,0.0817,0.0775,0.0726,0.0642,0.0565,0.05,0.0443,0.039,0.0345,0.031,0.0276,0.0247,0.0152,0.0118,0.0114],[0.0595,0.0587,0.056,0.0523,0.048,0.043,0.039,0.035,0.0317,0.0285,0.0263,0.024,0.0223,0.0148,0.011,0.0108]],"VI":[[0.1215,0.1195,0.113,0.1053,0.0916,0.0803,0.0703,0.0617,0.0543,0.0478,0.0417,0.0377,0.0324,0.0195,0.015,0.014],[0.1135,0.1117,0.106,0.087,0.0865,0.0757,0.0666,0.0585,0.0515,0.0452,0.0397,0.035,0.031,0.0189,0.0145,0.0135],[0.105,0.0995,0.0944,0.086,0.0798,0.0686,0.0606,0.0536,0.0474,0.042,0.0373,0.0333,0.0295,0.0183,0.014,0.0129],[0.0863,0.0858,0.0816,0.077,0.069,0.0617,0.0553,0.049,0.044,0.039,0.035,0.031,0.0278,0.0172,0.0135,0.0124],[0.0645,0.0637,0.061,0.058,0.0513,0.0457,0.0407,0.0363,0.0323,0.0292,0.0265,0.0242,0.0222,0.0167,0.013,0.012]],"VII":[[0.106,0.105,0.1,0.0934,0.0817,0.0716,0.0633,0.0555,0.049,0.043,0.0382,0.0337,0.03,0.019,0.015,0.0133],[0.097,0.096,0.091,0.0786,0.0763,0.0677,0.0603,0.0534,0.0474,0.0417,0.037,0.0327,0.029,0.0181,0.0142,0.0129],[0.085,0.084,0.08,0.0757,0.0676,0.0606,0.054,0.0482,0.043,0.038,0.034,0.0303,0.0272,0.0175,0.0135,0.0125],[0.071,0.07,0.067,0.0632,0.0565,0.0506,0.0455,0.0407,0.04,0.033,0.0298,0.0271,0.0247,0.0168,0.0127,0.0117],[0.057,0.056,0.054,0.051,0.046,0.0408,0.0365,0.0326,0.0293,0.0265,0.0238,0.0218,0.02,0.016,0.0121,0.011]],"VIII":[[0.162,0.156,0.136,0.121,0.0963,0.0805,0.0676,0.0572,0.0483,0.0422,0.0375,0.0334,0.0298,0.024,0.017,0.016],[0.146,0.142,0.127,0.112,0.0905,0.076,0.0645,0.055,0.0477,0.0416,0.0366,0.0327,0.0292,0.0225,0.016,0.015],[0.119,0.116,0.104,0.0933,0.0773,0.0656,0.056,0.0486,0.0435,0.0386,0.0345,0.0309,0.028,0.021,0.015,0.014],[0.101,0.0987,0.091,0.0824,0.0693,0.0593,0.0513,0.0445,0.0394,0.0352,0.032,0.0293,0.0265,0.019,0.014,0.013],[0.062,0.0615,0.0587,0.055,0.05,0.045,0.0403,0.0365,0.033,0.03,0.0275,0.0253,0.0235,0.0173,0.013,0.012]],"IX":[[0.1923,0.1825,0.157,0.143,0.1152,0.0956,0.081,0.0705,0.0616,0.0549,0.0489,0.0443,0.0407,0.029,0.022,0.02],[0.1912,0.1555,0.1395,0.1233,0.103,0.0868,0.0762,0.0663,0.0587,0.0527,0.0469,0.0425,0.039,0.0279,0.021,0.019],[0.1095,0.105,0.1015,0.0931,0.0811,0.0724,0.0642,0.0563,0.0534,0.0463,0.0425,0.0385,0.0355,0.0262,0.02,0.0178],[0.0905,0.082,0.08,0.0756,0.074,0.0607,0.0553,0.0493,0.0452,0.0407,0.0372,0.0345,0.0322,0.0233,0.019,0.0165],[0.064,0.0635,0.061,0.0572,0.051,0.0468,0.0433,0.0396,0.0367,0.0336,0.0317,0.03,0.028,0.022,0.0178,0.0155]],"X":[[0.0946,0.0932,0.0887,0.0833,0.0733,0.0645,0.0568,0.05,0.0443,0.0388,0.0345,0.0305,0.0277,0.02,0.015,0.013],[0.0893,0.088,0.0836,0.0788,0.069,0.0608,0.0537,0.0473,0.0417,0.037,0.033,0.0293,0.0263,0.0192,0.0145,0.0128],[0.0806,0.0796,0.0757,0.071,0.0628,0.0555,0.0487,0.0433,0.0383,0.034,0.0303,0.027,0.0246,0.0183,0.014,0.0125],[0.0717,0.0707,0.067,0.0635,0.0557,0.0495,0.0437,0.0387,0.0346,0.0307,0.0277,0.0253,0.023,0.0179,0.0135,0.0122],[0.0525,0.052,0.05,0.0472,0.0425,0.0382,0.0345,0.0313,0.0283,0.0262,0.0243,0.0242,0.0216,0.0173,0.013,0.0115]],"XI":[[0.0888,0.0862,0.08,0.0714,0.0607,0.0524,0.0461,0.0406,0.0364,0.033,0.0304,0.028,0.0267,0.0216,0.0182,0.0161],[0.0712,0.0696,0.0667,0.0612,0.0541,0.0478,0.043,0.0385,0.0348,0.0317,0.0294,0.0273,0.0258,0.0211,0.0176,0.0157],[0.0631,0.0615,0.0582,0.0542,0.048,0.0431,0.0388,0.036,0.0315,0.0286,0.0268,0.0251,0.0234,0.0196,0.0164,0.0149],[0.0518,0.0508,0.0479,0.0459,0.0403,0.0364,0.0327,0.0304,0.0283,0.0261,0.0255,0.0233,0.0222,0.0185,0.0157,0.0143],[0.0431,0.042,0.0398,0.0375,0.0339,0.0316,0.0286,0.0264,0.0245,0.023,0.0218,0.021,0.0204,0.0172,0.0148,0.0136]],"XII":[[0.09,0.088,0.0807,0.0727,0.06,0.0503,0.0423,0.036,0.0307,0.027,0.0242,0.0225,0.0218,0.0185,0.015,0.0138],[0.079,0.0755,0.0705,0.0647,0.055,0.0466,0.0397,0.0344,0.0297,0.026,0.0237,0.022,0.0213,0.0175,0.0142,0.0134],[0.0614,0.0604,0.0567,0.0527,0.0455,0.0396,0.0345,0.0303,0.027,0.0244,0.0224,0.0214,0.0208,0.017,0.0138,0.0129],[0.052,0.051,0.0487,0.046,0.0406,0.0357,0.0317,0.0283,0.0253,0.0232,0.0217,0.0205,0.0197,0.0165,0.013,0.0122],[0.041,0.0404,0.0387,0.0365,0.0327,0.0295,0.0265,0.0243,0.0222,0.0207,0.0197,0.0188,0.0185,0.0153,0.012,0.0115]],"XIII":[[0.154,0.149,0.139,0.105,0.0901,0.0763,0.0658,0.057,0.0506,0.0449,0.0403,0.0366,0.0334,0.0253,0.0208,0.0183],[0.129,0.126,0.112,0.099,0.0834,0.0713,0.0624,0.0539,0.0476,0.0428,0.0382,0.035,0.0319,0.0241,0.0198,0.0177],[0.0975,0.0954,0.0878,0.0808,0.0694,0.0611,0.0534,0.0477,0.0427,0.0383,0.0351,0.0319,0.0294,0.0227,0.0185,0.0168],[0.0756,0.074,0.0684,0.0648,0.0542,0.0515,0.0478,0.0417,0.0375,0.0345,0.0317,0.0296,0.0268,0.0214,0.0184,0.016],[0.0543,0.053,0.0513,0.0491,0.0448,0.0415,0.0378,0.0351,0.032,0.0297,0.0278,0.0257,0.0246,0.02,0.0175,0.0152]],"XIV":[[0.23,0.215,0.207,0.175,0.119,0.0937,0.0756,0.0622,0.0517,0.0435,0.037,0.0315,0.0273,0.0185,0.014,0.012],[0.178,0.171,0.15,0.131,0.105,0.0855,0.0703,0.0585,0.0493,0.0415,0.0353,0.0303,0.0263,0.0178,0.0132,0.0112],[0.137,0.134,0.122,0.11,0.092,0.0757,0.0633,0.0533,0.0437,0.0383,0.0326,0.0284,0.025,0.017,0.0125,0.0103],[0.11,0.107,0.097,0.09,0.076,0.0646,0.0552,0.0467,0.0405,0.035,0.0305,0.0266,0.0236,0.016,0.0118,0.0095],[0.086,0.066,0.063,0.059,0.053,0.0464,0.041,0.0363,0.0317,0.028,0.0247,0.022,0.0197,0.014,0.01,0.0085]],"XV":[[0.261,0.251,0.233,0.21,0.153,0.121,0.0965,0.0786,0.0719,0.063,0.0508,0.044,0.0375,0.0259,0.0211,0.0191],[0.225,0.22,0.191,0.166,0.133,0.106,0.0875,0.073,0.0632,0.059,0.0478,0.042,0.037,0.0252,0.0206,0.0189],[0.158,0.157,0.136,0.11,0.099,0.084,0.0723,0.062,0.0548,0.0485,0.043,0.039,0.0354,0.0234,0.0195,0.0181],[0.105,0.103,0.094,0.087,0.0755,0.066,0.059,0.052,0.0463,0.0418,0.0383,0.0345,0.0313,0.0215,0.0185,0.0166],[0.074,0.073,0.0687,0.064,0.057,0.0514,0.0463,0.0421,0.0386,0.035,0.0321,0.0295,0.0274,0.0202,0.0172,0.0155]],"XVI":[[0.3,0.29,0.249,0.229,0.184,0.155,0.129,0.106,0.09,0.0768,0.0674,0.0593,0.053,0.0403,0.0298,0.0231],[0.252,0.243,0.215,0.2,0.166,0.138,0.114,0.096,0.082,0.0717,0.0627,0.0555,0.0507,0.0368,0.0287,0.0227],[0.194,0.189,0.173,0.155,0.13,0.11,0.092,0.079,0.0692,0.0617,0.0552,0.0493,0.0445,0.0324,0.027,0.0218],[0.148,0.143,0.13,0.119,0.099,0.087,0.074,0.066,0.059,0.053,0.0469,0.0428,0.0392,0.029,0.0242,0.0205],[0.094,0.092,0.089,0.081,0.071,0.063,0.057,0.052,0.0473,0.0433,0.0397,0.0357,0.033,0.0265,0.0228,0.0193]],"XVII":[[0.2,0.19,0.166,0.146,0.117,0.096,0.08,0.068,0.0575,0.049,0.042,0.036,0.0305,0.016,0.014,0.0125],[0.18,0.172,0.154,0.137,0.112,0.092,0.077,0.065,0.056,0.047,0.04,0.0345,0.0295,0.0155,0.0135,0.0122],[0.15,0.147,0.134,0.121,0.1,0.084,0.07,0.0539,0.05,0.043,0.037,0.0315,0.027,0.015,0.013,0.0118],[0.13,0.128,0.127,0.105,0.086,0.078,0.062,0.053,0.0455,0.0387,0.0335,0.0295,0.025,0.0145,0.0125,0.0115],[0.085,0.084,0.078,0.072,0.06,0.051,0.044,0.0375,0.0325,0.029,0.0262,0.0235,0.021,0.014,0.012,0.011]],"XVIII":[[0.302,0.276,0.236,0.221,0.167,0.139,0.114,0.0963,0.0819,0.0707,0.0615,0.0543,0.0478,0.0329,0.0254,0.0223],[0.236,0.229,0.202,0.181,0.15,0.125,0.105,0.0878,0.0765,0.066,0.058,0.0513,0.0433,0.0312,0.0246,0.0213],[0.184,0.179,0.158,0.142,0.118,0.1,0.0857,0.0746,0.0647,0.0567,0.0505,0.0451,0.0409,0.0285,0.0228,0.02],[0.129,0.126,0.114,0.098,0.088,0.077,0.067,0.0596,0.0534,0.0477,0.0431,0.0396,0.0357,0.0264,0.0213,0.0182],[0.092,0.089,0.082,0.075,0.0652,0.058,0.0513,0.0467,0.0428,0.039,0.0357,0.0326,0.0303,0.0232,0.019,0.0172]]}},"B6":{"pct":[0,2,4,6,8,10,15,20,30,40,50],"ha":[1,0.85,0.75,0.65,0.55,0.5,0.4,0.35,0.2,0.15,0.1],"thuong":[1,0.95,0.9,0.85,0.8,0.75,0.65,0.55,0.45,0.35,0.25]},"fixes":[{"reg":"IV","tau":30,"phils":40,"orig":0.816,"fix":0.0816,"kind":"dịch dấu phẩy","why":"0,816 → 0,0816 (dịch dấu phẩy)"},{"reg":"XI","tau":20,"phils":40,"orig":0.461,"fix":0.0461,"kind":"dịch dấu phẩy","why":"0,461 → 0,0461 (dịch dấu phẩy)"},{"reg":"XIII","tau":20,"phils":1,"orig":0.0149,"fix":0.149,"kind":"dịch dấu phẩy","why":"0,0149 → 0,149 (dịch dấu phẩy)"},{"reg":"XVI","tau":20,"phils":50,"orig":0.0106,"fix":0.106,"kind":"dịch dấu phẩy","why":"0,0106 → 0,106 (dịch dấu phẩy)"},{"reg":"XVIII","tau":180,"phils":100,"orig":0.303,"fix":0.0303,"kind":"dịch dấu phẩy","why":"0,303 → 0,0303 (dịch dấu phẩy)"},{"reg":"I","tau":90,"phils":20,"orig":0.017,"fix":0.077,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0170 → 0,0770 (1↔7), nằm giữa 0,0930 và 0,0650"},{"reg":"I","tau":180,"phils":5,"orig":0.057,"fix":0.067,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0570 → 0,0670, nằm giữa 0,0710 và 0,0630"},{"reg":"V","tau":180,"phils":10,"orig":0.0583,"fix":0.0523,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0583 → 0,0523, phải < 0,0560 (φls=5)"},{"reg":"X","tau":180,"phils":40,"orig":0.0435,"fix":0.0345,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0435 → 0,0345 (đảo chữ số), nằm giữa 0,0382 và 0,0313"},{"reg":"XIII","tau":60,"phils":80,"orig":0.0315,"fix":0.0351,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0315 → 0,0351 (đảo chữ số), nằm giữa 0,0383 và 0,0319"},{"reg":"XIII","tau":180,"phils":50,"orig":0.0315,"fix":0.0351,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0315 → 0,0351 (đảo chữ số), nằm giữa 0,0378 và 0,0320"},{"reg":"XIV","tau":180,"phils":10,"orig":0.051,"fix":0.059,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0510 → 0,0590, phải > 0,0530 (φls=20)"},{"reg":"XV","tau":60,"phils":1,"orig":0.117,"fix":0.157,"kind":"hiệu chỉnh theo ô lân cận","why":"0,1170 → 0,1570, phải ≈ 0,97–0,99 lần 0,1580"},{"reg":"XVIII","tau":20,"phils":20,"orig":0.0167,"fix":0.167,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0167 → 0,1670 (dấu phẩy)"},{"reg":"XVIII","tau":20,"phils":30,"orig":0.0139,"fix":0.139,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0139 → 0,1390 (dấu phẩy)"},{"reg":"XVIII","tau":20,"phils":40,"orig":0.0114,"fix":0.114,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0114 → 0,1140 (dấu phẩy)"},{"reg":"XVIII","tau":20,"phils":50,"orig":0.963,"fix":0.0963,"kind":"hiệu chỉnh theo ô lân cận","why":"0,9630 → 0,0963 (dấu phẩy)"},{"reg":"XVIII","tau":30,"phils":20,"orig":0.015,"fix":0.15,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0150 → 0,1500 (dấu phẩy)"},{"reg":"XVIII","tau":30,"phils":30,"orig":0.0125,"fix":0.125,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0125 → 0,1250 (dấu phẩy)"},{"reg":"XVIII","tau":30,"phils":40,"orig":0.0105,"fix":0.105,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0105 → 0,1050 (dấu phẩy)"},{"reg":"XVIII","tau":30,"phils":50,"orig":0.0978,"fix":0.0878,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0978 → 0,0878, phải < 0,0963 (τsd=20) và nằm giữa 0,1050 và 0,0765"},{"reg":"XVIII","tau":60,"phils":5,"orig":0.138,"fix":0.158,"kind":"hiệu chỉnh theo ô lân cận","why":"0,1380 → 0,1580, nằm giữa 0,1790 và 0,1420"},{"reg":"XVIII","tau":60,"phils":20,"orig":0.0118,"fix":0.118,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0118 → 0,1180 (dấu phẩy)"},{"reg":"XVIII","tau":60,"phils":30,"orig":0.01,"fix":0.1,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0100 → 0,1000 (dấu phẩy)"},{"reg":"XVIII","tau":60,"phils":90,"orig":0.0541,"fix":0.0451,"kind":"hiệu chỉnh theo ô lân cận","why":"0,0541 → 0,0451 (đảo chữ số), nằm giữa 0,0505 và 0,0409"}]};

  const REGIONS = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII'];
  const REGION_NAMES = {
    I:'Lưu vực thượng nguồn sông Mã, sông Chu, sông Cả',
    II:'Vùng thượng nguồn sông Đà từ biên giới đến Nghĩa Lộ',
    III:'Tâm mưa Hoàng Liên Sơn hữu ngạn sông Thao, từ biên giới đến Ngòi Bút',
    IV:'Lưu vực sông Kỳ Cùng, sông Bằng Giang, thượng nguồn sông Hồng',
    V:'Lưu vực sông Gâm, tả ngạn sông Lô',
    VI:'Thung lũng sông Thao, sông Chảy, hạ lưu sông Lô Gâm',
    VII:'Các lưu vực bắt nguồn từ dãy Yên Tử đổ ra biển',
    VIII:'Vùng biển từ Hải Phòng đến Thanh Hóa',
    IX:'Các lưu vực phần trung du sông Mã, sông Chu ra đến biển',
    X:'Vùng ven biển từ Thanh Hóa đến Đồng Hới',
    XI:'Vùng ven biển từ Đồng Hới đến Đà Nẵng',
    XII:'Vùng ven biển từ Đà Nẵng đến Quảng Ngãi',
    XIII:'Vùng ven biển từ Quảng Ngãi đến Phan Rang',
    XIV:'Các lưu vực sông phía bắc Tây Nguyên',
    XV:'Các lưu vực sông phía nam Tây Nguyên',
    XVI:'Các lưu vực sông từ Ban Mê Thuột tới Bảo Lộc',
    XVII:'Vùng ven biển từ Phan Rang đến Vũng Tàu',
    XVIII:'Vùng đồng bằng Nam Bộ'
  };

  const REGION_NAMES_EN = {
    I:'Upper basins of the Ma, Chu and Ca rivers',
    II:'Upper Da river from the border to Nghia Lo',
    III:'Hoang Lien Son rain centre, right bank of the Thao river, border to Ngoi But',
    IV:'Ky Cung and Bang Giang basins, upper Red river',
    V:'Gam river basin, left bank of the Lo river',
    VI:'Thao and Chay valleys, lower Lo–Gam',
    VII:'Basins rising in the Yen Tu range and draining to the sea',
    VIII:'Coastal zone from Hai Phong to Thanh Hoa',
    IX:'Midland Ma and Chu basins down to the sea',
    X:'Coast from Thanh Hoa to Dong Hoi',
    XI:'Coast from Dong Hoi to Da Nang',
    XII:'Coast from Da Nang to Quang Ngai',
    XIII:'Coast from Quang Ngai to Phan Rang',
    XIV:'Northern Central Highlands basins',
    XV:'Southern Central Highlands basins',
    XVI:'Basins from Buon Ma Thuot to Bao Loc',
    XVII:'Coast from Phan Rang to Vung Tau',
    XVIII:'Mekong Delta (Southern plain)'
  };
  const regionName = r => tr(REGION_NAMES[r], REGION_NAMES_EN[r]);

  // Bảng 1 — phân cấp đất theo hàm lượng cát
  const SOIL_BY_SAND = [[2,'I'],[12,'II'],[30,'III'],[62,'IV'],[83,'V'],[100,'VI']];

  // Bảng 4 — m_sd
  const MSD = {
    cases: ['Cỏ thưa','Trung bình','Cỏ dày'], casesEn: ['Sparse grass','Medium','Dense grass'],
    rows: [
      { name:'Bề mặt nhẵn (át phan, bê tông…)', en:'Smooth surface (asphalt, concrete…)', v:[0.50,0.50,0.50] },
      { name:'Đất đồng bằng hay nứt nẻ, đất san phẳng đầm chặt', en:'Cracked lowland soil, levelled and compacted ground', v:[0.40,0.30,0.25] },
      { name:'Mặt đất thu dọn sạch, không gốc cây, không cày xới; dân cư ≤ 20%; mặt đá xếp', en:'Cleared ground without stumps or ploughing; built-up ≤ 20%; laid stone', v:[0.30,0.25,0.20] },
      { name:'Mặt đất bị cày xới, nhiều gốc bụi; dân cư > 20%', en:'Ploughed ground with many stumps/shrubs; built-up > 20%', v:[0.20,0.15,0.10] }
    ]
  };
  // Bảng 5 — m_ls
  const MLS = [
    { name:'Sông đồng bằng ổn định, lòng khá sạch; suối không có nước thường xuyên, chảy thuận lợi', en:'Stable lowland river, fairly clean bed; intermittent stream with favourable flow', v:11 },
    { name:'Sông lớn và trung bình quanh co, tắc nghẽn, có cỏ, có đá; mùa lũ cuốn nhiều sỏi cuội, bùn cát', en:'Large/medium meandering river, obstructed, grassy, stony; heavy gravel and sediment in floods', v:9 },
    { name:'Sông vùng núi, lòng nhiều đá, mặt nước không phẳng; suối quanh co, tắc nghẽn', en:'Mountain river, rocky bed, rough water surface; meandering, obstructed stream', v:7 }
  ];

  // Bảng 10 — vận tốc cho phép không xói V_cp (m/s), chiều sâu 0,4 / 1 / 2 / 3 m — không nội suy
  const VCP = {
    depths: [0.4, 1.0, 2.0, 3.0],
    rows: [
      { id:'co-nam', en:'Flat-laid turf (on firm ground)',   name:'Lát cỏ nằm (trên nền chắc)', v:[0.9,1.2,1.3,1.4] },
      { id:'co-tuong', en:'Turf laid as a wall', name:'Lát cỏ trồng thành tường', v:[1.5,1.8,2.0,2.2] },
      { id:'da1-15', en:'Single-layer stone on straw (≥ 5 cm bedding), Ø15 cm stone',   name:'Lát đá 1 lớp trên rơm rạ (lớp lót ≥ 5 cm), đá Ø15 cm', v:[2.0,2.5,3.0,3.5] },
      { id:'da1-20', en:'Single-layer stone on straw (≥ 5 cm bedding), Ø20 cm stone',   name:'Lát đá 1 lớp trên rơm rạ (lớp lót ≥ 5 cm), đá Ø20 cm', v:[2.5,3.0,3.5,4.0] },
      { id:'da1-25', en:'Single-layer stone on straw (≥ 5 cm bedding), Ø25 cm stone',   name:'Lát đá 1 lớp trên rơm rạ (lớp lót ≥ 5 cm), đá Ø25 cm', v:[3.0,3.5,4.0,4.5] },
      { id:'dad-15', en:'Single-layer stone on ≥ 10 cm crushed stone, 15 cm stone',   name:'Lát đá 1 lớp trên đá dăm ≥ 10 cm, đá 15 cm', v:[2.5,3.0,3.5,4.5] },
      { id:'dad-20', en:'Single-layer stone on ≥ 10 cm crushed stone, 20 cm stone',   name:'Lát đá 1 lớp trên đá dăm ≥ 10 cm, đá 20 cm', v:[3.0,3.5,4.0,4.5] },
      { id:'dad-25', en:'Single-layer stone on ≥ 10 cm crushed stone, 25 cm stone',   name:'Lát đá 1 lớp trên đá dăm ≥ 10 cm, đá 25 cm', v:[3.5,4.0,4.5,5.0] },
      { id:'dck-20', en:'Carefully laid, chinked stone on crushed stone/gravel, 20 cm stone',   name:'Lát đá cẩn thận, chèn chặt, trên đá dăm/sỏi, đá 20 cm', v:[3.5,4.5,5.0,5.5] },
      { id:'dck-25', en:'Carefully laid, chinked stone on crushed stone/gravel, 25 cm stone',   name:'Lát đá cẩn thận, chèn chặt, trên đá dăm/sỏi, đá 25 cm', v:[4.0,4.5,5.5,5.5] },
      { id:'dck-30', en:'Carefully laid, chinked stone on crushed stone/gravel, 30 cm stone',   name:'Lát đá cẩn thận, chèn chặt, trên đá dăm/sỏi, đá 30 cm', v:[4.5,5.0,6.0,6.0] },
      { id:'da2', en:'Two-layer stone pitching (15 cm under, 20 cm over) on crushed stone/gravel',      name:'Lát đá 2 lớp (dưới 15 cm, trên 20 cm) trên đá dăm/sỏi', v:[3.5,4.5,5.0,5.5] },
      { id:'datang', en:'Stone blocks 0.5×0.5×1.0 m',   name:'Lát đá tảng 0,5×0,5×1,0 m', v:[4.0,5.0,5.5,6.0] },
      { id:'dv100', en:'Dry limestone pitching, strength > 100 kG/cm²',    name:'Lát đá khan, đá vôi cường độ > 100 kG/cm²', v:[3.0,3.5,4.0,4.5] },
      { id:'dv300', en:'Dry limestone pitching, strength > 300 kG/cm²',    name:'Lát đá khan, đá vôi cường độ > 300 kG/cm²', v:[6.5,8.0,10.0,12.0] },
      { id:'bt200', en:'Concrete lining, grade 200',    name:'Lớp áo bê tông mác 200', v:[6.5,8.0,9.0,10.0] },
      { id:'bt150', en:'Concrete lining, grade 150',    name:'Lớp áo bê tông mác 150', v:[6.0,7.0,8.0,9.0] },
      { id:'bt100', en:'Concrete lining, grade 100',    name:'Lớp áo bê tông mác 100', v:[5.0,6.0,7.0,7.5] },
      { id:'mbt200', en:'Smooth-plastered concrete chute, grade 200',   name:'Máng bê tông trát nhẵn mác 200', v:[13,16,19,20] },
      { id:'mbt150', en:'Smooth-plastered concrete chute, grade 150',   name:'Máng bê tông trát nhẵn mác 150', v:[12,14,16,18] },
      { id:'mbt100', en:'Smooth-plastered concrete chute, grade 100',   name:'Máng bê tông trát nhẵn mác 100', v:[10,12,13,15] }
    ]
  };

  /* ------------ tiện ích nội suy ------------ */
  function clampInfo(x, lo, hi) {
    if (x < lo) return { x: lo, clamped: 'dưới' };
    if (x > hi) return { x: hi, clamped: 'trên' };
    return { x, clamped: null };
  }
  function bracket(arr, x) { // arr tăng dần, x đã kẹp trong khoảng
    for (let i = 0; i < arr.length - 1; i++) if (x <= arr[i + 1]) return i;
    return arr.length - 2;
  }
  function lerp(x, x0, x1, y0, y1) { return x1 === x0 ? y0 : y0 + (y1 - y0) * (x - x0) / (x1 - x0); }

  /* ======================= 2. THỦY VĂN ======================= */

  function soilFromSand(p) {
    for (const [ub, c] of SOIL_BY_SAND) if (p <= ub + 0.05) return c;
    return 'VI';
  }

  // Bảng A.1: 13 cột hệ số theo F. Tiêu đề gốc gộp: F<0,1 (5 cột) | 0,1–1 (2) | 1–10 (3) | 10–100 (2) | >100 (1).
  // Cột con không ghi giá trị F; app chia đều theo thang log trong mỗi nhóm (giả định, người dùng chọn lại được).
  const A1_COLS = (function () {
    const g = [[0.01, 0.1, 5], [0.1, 1, 2], [1, 10, 3], [10, 100, 2]];
    const out = []; let lo = 0;
    g.forEach(([a, b, n], gi) => {
      for (let k = 1; k <= n; k++) {
        const ub = Math.pow(10, Math.log10(a) + (Math.log10(b) - Math.log10(a)) * k / n);
        out.push({ lo, hi: ub, gi });
        lo = ub;
      }
    });
    out.push({ lo: 100, hi: Infinity, gi: 4 });
    out.forEach((c, i) => { c.idx = i; });
    return out;
  })();
  // nhãn cột A.1 theo ngôn ngữ hiện hành (getter để luôn cập nhật)
  A1_COLS.forEach(c => {
    Object.defineProperty(c, 'group', { get: () => ['F < 0,1','0,1 < F < 1,0','1,0 < F < 10','10 < F < 100','F > 100'].map(x => LANG === 'en' ? x.replace(/,/g, '.') : x)[c.gi] });
    Object.defineProperty(c, 'label', { get: () => tr('Cột ', 'Col. ') + (c.idx + 3) + ' (' + fmtRange(c.lo, c.hi) + ' km²)' });
    Object.defineProperty(c, 'range', { get: () => fmtRange(c.lo, c.hi) });
  });
  function fmtRange(lo, hi) {
    const f = v => { const t = (v < 0.1 ? v.toFixed(3) : v < 10 ? v.toFixed(2) : v.toFixed(0)); return LANG === 'en' ? t : t.replace('.', ','); };
    if (lo === 0) return '≤ ' + f(hi);
    if (hi === Infinity) return '> ' + f(lo);
    return f(lo) + '–' + f(hi);
  }
  function a1ColForF(F) {
    for (const c of A1_COLS) if (F <= c.hi + 1e-12) return c.idx;
    return A1_COLS.length - 1;
  }
  function parseBand(s) {
    s = s.replace(/\s/g, '');
    if (s.startsWith('<')) return [0, +s.slice(1)];
    if (s.startsWith('>')) return [+s.slice(1), Infinity];
    const [a, b] = s.split('-').map(Number); return [a, b];
  }
  function a1Row(cap) {
    const notes = [];
    let key = cap;
    if (cap === 'I') { key = 'II'; notes.push(tr('Bảng A.1 không có hàng cấp đất I; tạm lấy theo cấp II. Nên nhập φ trực tiếp nếu lưu vực chủ yếu là đá/mặt không thấm.', 'Table A.1 has no row for soil class I; class II is used instead. Enter φ directly if the catchment is mostly rock or impervious surface.')); }
    const t = RAW.A1[key];
    return { key, t, notes };
  }
  function phiA1(cap, Hp, F, colOverride) {
    const { key, t, notes } = a1Row(cap);
    const col = (colOverride != null && colOverride !== '' && colOverride >= 0) ? +colOverride : a1ColForF(F);
    let bandIdx = 0, band = '—', row;
    if (key === 'VI') {
      const r = t.phi[0].slice(); // điền các ô trống bằng nội suy tuyến tính
      const known = r.map((v, i) => v == null ? null : i).filter(i => i != null);
      for (let i = 0; i < r.length; i++) if (r[i] == null) {
        const L = known.filter(k => k < i).pop(), R = known.find(k => k > i);
        r[i] = L == null ? r[R] : R == null ? r[L] : lerp(i, L, R, r[L], r[R]);
      }
      row = r; band = tr('mọi H_P', 'all H_P');
      notes.push(tr('Cấp đất VI: bảng gốc chỉ ghi giá trị ở cột 5, 9, 11, 13, 15 và không chia theo H_P; các cột còn lại nội suy.', 'Soil class VI: the original table only gives columns 5, 9, 11, 13, 15 with no H_P split; other columns are interpolated.'));
    } else {
      for (let i = 0; i < t.H.length; i++) {
        const [a, b] = parseBand(t.H[i]);
        if (Hp <= b + 0.999) { bandIdx = i; break; }
        bandIdx = i;
      }
      row = t.phi[bandIdx]; band = t.H[bandIdx];
    }
    return { phi: row[col], row, col, colInfo: A1_COLS[col], band, bandIdx, cap: key, notes };
  }

  // Bảng A.2: τ_sd theo φ_sd và vùng mưa (nội suy tuyến tính)
  function tauSd(region, phisd) {
    const P = RAW.A2.phi, T = RAW.A2.tau[region];
    const xs = [], ys = [];
    P.forEach((p, i) => { if (T[i] != null) { xs.push(p); ys.push(T[i]); } });
    const c = clampInfo(phisd, xs[0], xs[xs.length - 1]);
    const i = bracket(xs, c.x);
    const tau = lerp(c.x, xs[i], xs[i + 1], ys[i], ys[i + 1]);
    const notes = [];
    if (c.clamped) notes.push(tr(`φ_sd = ${fmt(phisd, 2)} nằm ${c.clamped} phạm vi Bảng A.2 (${fmt(xs[0],1)}–${fmt(xs[xs.length-1],1)}); lấy giá trị biên.`, `φ_sd = ${fmt(phisd, 2)} is ${c.clamped === 'dưới' ? 'below' : 'above'} the range of Table A.2 (${fmt(xs[0],1)}–${fmt(xs[xs.length-1],1)}); the boundary value is used.`));
    return { tau, x0: xs[i], x1: xs[i + 1], y0: ys[i], y1: ys[i + 1], used: c.x, notes };
  }

  // Bảng A.3: A_P theo vùng, τ_sd (20…180) và φ_ls (0…220) — nội suy song tuyến
  function apA3(region, tau, phils) {
    const T = RAW.A3.tau, X = RAW.A3.phils, M = RAW.A3.A[region];
    const notes = [];
    const ct = clampInfo(tau, T[0], T[T.length - 1]);
    const cx = clampInfo(phils, X[0], X[X.length - 1]);
    if (ct.clamped) notes.push(tr(`τ_sd = ${fmt(tau,1)} phút nằm ${ct.clamped} phạm vi Bảng A.3 (20–180); lấy giá trị biên.`, `τ_sd = ${fmt(tau,1)} min is ${ct.clamped === 'dưới' ? 'below' : 'above'} the range of Table A.3 (20–180); the boundary value is used.`));
    if (cx.clamped) notes.push(tr(`φ_ls = ${fmt(phils,1)} nằm ${cx.clamped} phạm vi Bảng A.3 (0–220); lấy giá trị biên.`, `φ_ls = ${fmt(phils,1)} is ${cx.clamped === 'dưới' ? 'below' : 'above'} the range of Table A.3 (0–220); the boundary value is used.`));
    const i = bracket(T, ct.x), j = bracket(X, cx.x);
    const a00 = M[i][j], a01 = M[i][j + 1], a10 = M[i + 1][j], a11 = M[i + 1][j + 1];
    const r0 = lerp(cx.x, X[j], X[j + 1], a00, a01);
    const r1 = lerp(cx.x, X[j], X[j + 1], a10, a11);
    const A = lerp(ct.x, T[i], T[i + 1], r0, r1);
    const fixed = RAW.fixes.filter(f => f.reg === region && [T[i], T[i + 1]].includes(f.tau) && [X[j], X[j + 1]].includes(f.phils));
    fixed.forEach(f => notes.push(tr(`Ô (τ_sd=${f.tau}; φ_ls=${f.phils}) đã hiệu chỉnh lỗi in: ${f.why}.`, `Cell (τ_sd=${f.tau}; φ_ls=${f.phils}) corrected for a misprint: ${whyText(f)}.`)));
    return { A, t0: T[i], t1: T[i + 1], x0: X[j], x1: X[j + 1], a00, a01, a10, a11, r0, r1, tauU: ct.x, phiU: cx.x, notes };
  }

  // Bảng 6: δ theo % diện tích hồ ao, đầm lầy
  function deltaB6(pct, pos) {
    if (!pct || pct <= 0) return { delta: 1, notes: [] };
    const P = RAW.B6.pct, V = pos === 'thuong' ? RAW.B6.thuong : RAW.B6.ha;
    const c = clampInfo(pct, 0, 50); const i = bracket(P, c.x);
    const notes = c.clamped ? [tr('Tỷ lệ hồ ao > 50%: lấy δ ở biên bảng.', 'Lake/swamp share > 50%: δ taken at the table boundary.')] : [];
    return { delta: lerp(c.x, P[i], P[i + 1], V[i], V[i + 1]), notes };
  }

  function flood(inp) {
    const s = { inp, notes: [], steps: {} };
    const F = +inp.F, L = +inp.L, sumL = +inp.sumL || 0, Jls = +inp.Jls, Jsd = +inp.Jsd, Hp = +inp.Hp;
    if (!(F > 0 && L > 0 && Jls > 0 && Jsd > 0 && Hp > 0)) { s.error = tr('Cần nhập F, L, J_ls, J_sd và H_P lớn hơn 0.', 'F, L, J_ls, J_sd and H_P must all be greater than 0.'); return s; }
    if (F > 100) s.notes.push(tr('F > 100 km²: theo mục 5.1, nên dùng công thức triết giảm (5.3) và đối chiếu các phương pháp khác. Kết quả dưới đây chỉ để tham khảo.', 'F > 100 km²: clause 5.1 recommends the reduction formula (5.3) and cross-checking with other methods. The result below is for reference only.'));
    const k18 = inp.oneSide ? 0.9 : 1.8;
    s.B = inp.oneSide ? F / L : F / (2 * L);
    s.Lsd = 1000 * F / (k18 * (L + sumL)); s.k18 = k18;
    s.cap = inp.capMode === 'sand' ? soilFromSand(+inp.sand) : inp.cap;
    // φ
    const a1 = phiA1(s.cap, Hp, F, inp.a1col);
    s.a1 = a1; a1.notes.forEach(n => s.notes.push(n));
    s.phi = (inp.phiManual != null && inp.phiManual !== '' && +inp.phiManual > 0) ? +inp.phiManual : a1.phi;
    s.phiSource = (s.phi === a1.phi) ? 'A1' : 'manual';
    s.msd = +inp.msd; s.mls = +inp.mls;
    const pH = s.phi * Hp;
    s.phiSd = Math.pow(s.Lsd, 0.6) / (s.msd * Math.pow(Jsd, 0.3) * Math.pow(pH, 0.4));
    s.phiLs = inp.noChannel ? 0 : 1000 * L / (s.mls * Math.cbrt(Jls) * Math.pow(F, 0.25) * Math.pow(pH, 0.25));
    if (inp.noChannel) s.notes.push(tr('Lòng sông không rõ ràng: lấy φ_ls = 0 theo 5.2.3.', 'No defined channel: φ_ls = 0 per clause 5.2.3.'));
    s.ta = tauSd(inp.region, s.phiSd); s.ta.notes.forEach(n => s.notes.push(n));
    s.tau = s.ta.tau;
    s.ap = apA3(inp.region, s.tau, s.phiLs); s.ap.notes.forEach(n => s.notes.push(n));
    s.Ap = s.ap.A;
    const d = deltaB6(+inp.lakePct || 0, inp.lakePos); s.delta = d.delta; d.notes.forEach(n => s.notes.push(n));
    s.Q = s.Ap * s.phi * Hp * F * s.delta;
    return s;
  }

  /* ======================= 3. THỦY LỰC CỐNG (Phụ lục D) ======================= */
  const G = 9.81;
  const KU_INLET = 1.811;   // HDS-5, hệ SI
  // Loại cửa vào: hệ số HDS-5 Table A.1 (K, M, c, Y, dạng phương trình) và k_e (HDS-5 Table C.1 ~ Bảng C.1 TCVN 9845)
  const INLETS = [
    // —— Cống tròn bê tông (toán đồ D.1, D.2)
    { id:'C-SQ', en:'Concrete pipe — headwall, square edge',  shape:'circ', chart:'D.1 (1)', name:'Tròn BT — tường đầu, miệng vuông', form:1, K:0.0098, M:2.0,  c:0.0398, Y:0.67, ke:0.5 },
    { id:'C-GR', en:'Concrete pipe — headwall, groove (socket) end',  shape:'circ', chart:'D.1 (2)', name:'Tròn BT — tường đầu, đầu loe (đầu khớp)', form:1, K:0.0018, M:2.0,  c:0.0292, Y:0.74, ke:0.2 },
    { id:'C-PR', en:'Concrete pipe — projecting, groove end',  shape:'circ', chart:'D.1 (3)', name:'Tròn BT — nhô ra khỏi nền đắp, đầu loe', form:1, K:0.0045, M:2.0,  c:0.0317, Y:0.69, ke:0.2 },
    { id:'C-B45', en:'Circular — 45° beveled ring', shape:'circ', chart:'D.2 (A)', name:'Tròn — cửa vát 45°', form:1, K:0.0018, M:2.5,  c:0.0300, Y:0.74, ke:0.2 },
    { id:'C-B33', en:'Circular — 33.7° beveled ring', shape:'circ', chart:'D.2 (B)', name:'Tròn — cửa vát 33,7°', form:1, K:0.0018, M:2.5,  c:0.0243, Y:0.83, ke:0.2 },
    // —— Cống tròn tôn lượn sóng
    { id:'M-HW', en:'Corrugated metal pipe — headwall',  shape:'circ', chart:'HDS-5 Ch.2 (1)', name:'Tròn tôn lượn sóng — tường đầu', form:1, K:0.0078, M:2.0,  c:0.0379, Y:0.69, ke:0.5, n:0.024 },
    { id:'M-MI', en:'Corrugated metal pipe — mitered to slope',  shape:'circ', chart:'HDS-5 Ch.2 (2)', name:'Tròn tôn lượn sóng — cắt vát theo mái đắp', form:1, K:0.0210, M:1.33, c:0.0463, Y:0.75, ke:0.7, n:0.024, mitered:true },
    { id:'M-PR', en:'Corrugated metal pipe — projecting',  shape:'circ', chart:'HDS-5 Ch.2 (3)', name:'Tròn tôn lượn sóng — nhô ra nền đắp', form:1, K:0.0340, M:1.5,  c:0.0553, Y:0.54, ke:0.9, n:0.024 },
    // —— Cống hộp BTCT (toán đồ D.3 – D.6)
    { id:'B-W30', en:'Box — 30°–75° wingwall flare', shape:'box', chart:'D.3 (1)', name:'Hộp — tường cánh mở 30°–75°', form:1, K:0.026, M:1.0,  c:0.0347, Y:0.81, ke:0.4 },
    { id:'B-W90', en:'Box — 90° and 15° wingwall flare', shape:'box', chart:'D.3 (2)', name:'Hộp — tường cánh 90° và 15°', form:1, K:0.061, M:0.75, c:0.0400, Y:0.80, ke:0.5 },
    { id:'B-W0', en:'Box — 0° wingwall flare (parallel)',  shape:'box', chart:'D.3 (3)', name:'Hộp — tường cánh 0° (song song)', form:1, K:0.061, M:0.75, c:0.0423, Y:0.82, ke:0.7 },
    { id:'B-CH', en:'Box — 90° headwall, 19 mm chamfers',  shape:'box', chart:'D.4 (1)', name:'Hộp — tường đầu 90°, vát cạnh nhỏ 19 mm', form:2, K:0.515, M:0.667, c:0.0375, Y:0.79, ke:0.5 },
    { id:'B-B45', en:'Box — 90° headwall, 45° bevels', shape:'box', chart:'D.4 (2)', name:'Hộp — tường đầu 90°, vát cạnh 45°', form:2, K:0.495, M:0.667, c:0.0314, Y:0.82, ke:0.2 },
    { id:'B-B33', en:'Box — 90° headwall, 33.7° bevels', shape:'box', chart:'D.4 (3)', name:'Hộp — tường đầu 90°, vát cạnh 33,7°', form:2, K:0.486, M:0.667, c:0.0252, Y:0.865, ke:0.2 },
    { id:'B-S45', en:'Box — headwall skewed 45° to flow', shape:'box', chart:'D.5 (1)', name:'Hộp — tường đầu xiên 45° so với dòng chảy', form:2, K:0.545, M:0.667, c:0.04505, Y:0.73, ke:0.5 },
    { id:'B-S30', en:'Box — headwall skewed 30°', shape:'box', chart:'D.5 (2)', name:'Hộp — tường đầu xiên 30°', form:2, K:0.533, M:0.667, c:0.0425, Y:0.705, ke:0.5 },
    { id:'B-S15', en:'Box — headwall skewed 15°', shape:'box', chart:'D.5 (3)', name:'Hộp — tường đầu xiên 15°', form:2, K:0.522, M:0.667, c:0.0402, Y:0.68, ke:0.5 },
    { id:'B-F45', en:'Box — 45° flared wingwalls (non-offset)', shape:'box', chart:'D.6 (1)', name:'Hộp — tường cánh loe 45° (không lệch)', form:2, K:0.497, M:0.667, c:0.0339, Y:0.803, ke:0.4 },
    { id:'B-F18', en:'Box — 18.4° flared wingwalls (non-offset)', shape:'box', chart:'D.6 (2)', name:'Hộp — tường cánh loe 18,4° (không lệch)', form:2, K:0.493, M:0.667, c:0.0361, Y:0.806, ke:0.5 }
  ];
  const inletById = id => INLETS.find(x => x.id === id);

  // Hình học mặt cắt (1 cửa)
  function geom(cv, y) {
    if (cv.shape === 'circ') {
      const D = cv.D, r = D / 2;
      y = Math.max(1e-9, Math.min(y, D));
      const th = 2 * Math.acos(1 - 2 * y / D);               // góc ở tâm
      const A = r * r * (th - Math.sin(th)) / 2;
      const P = r * th;
      const T = y >= D ? 1e-9 : D * Math.sin(th / 2);
      return { A, P, T, R: A / P };
    }
    const B = cv.B, H = cv.H; y = Math.max(1e-9, Math.min(y, H));
    const A = B * y, P = B + 2 * y + (y >= H ? B : 0);
    return { A, P, T: y >= H ? 1e-9 : B, R: A / P };
  }
  function rise(cv) { return cv.shape === 'circ' ? cv.D : cv.H; }
  function fullArea(cv) { return cv.shape === 'circ' ? Math.PI * cv.D * cv.D / 4 : cv.B * cv.H; }
  function fullPerim(cv) { return cv.shape === 'circ' ? Math.PI * cv.D : 2 * (cv.B + cv.H); }

  function bisect(f, a, b, it = 80) {
    let fa = f(a);
    for (let k = 0; k < it; k++) { const m = (a + b) / 2, fm = f(m); if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else b = m; }
    return (a + b) / 2;
  }

  // Chiều sâu phân giới d_c (thay toán đồ D.9, D.11): Q²/g = A³/T
  function criticalDepth(cv, q) {
    const Dr = rise(cv);
    if (cv.shape === 'box') { const dc = Math.cbrt(Math.pow(q / cv.B, 2) / G); return Math.min(dc, Dr); }
    const f = y => { const g = geom(cv, y); return q * q / G - g.A * g.A * g.A / g.T; };
    if (f(0.999 * Dr) > 0) return Dr;  // vượt khả năng mặt cắt: lấy d_c = D
    return bisect(f, 1e-6, 0.999 * Dr);
  }
  // Chiều sâu chảy đều d_n (Manning)
  function normalDepth(cv, q, n, S) {
    const Dr = rise(cv);
    if (!(S > 0)) return { dn: Dr, full: true };
    const Qof = y => { const g = geom(cv, y); return g.A * Math.pow(g.R, 2 / 3) * Math.sqrt(S) / n; };
    const yMax = cv.shape === 'circ' ? 0.938 * Dr : 0.999 * Dr;
    if (Qof(yMax) < q) return { dn: Dr, full: true };
    return { dn: bisect(y => Qof(y) - q, 1e-6, yMax), full: false };
  }

  // Kiểm soát cửa vào — HDS-5 (toán đồ D.1–D.6)
  function inletControl(cv, q, S, inlet) {
    const D = rise(cv), A = fullArea(cv);
    const X = KU_INLET * q / (A * Math.sqrt(D));
    const ks = inlet.mitered ? 0.7 : -0.5;
    const dc = criticalDepth(cv, q), gc = geom(cv, dc);
    const Vc = q / gc.A, Hc = dc + Vc * Vc / (2 * G);
    const unsub = x => inlet.form === 1
      ? Hc / D + inlet.K * Math.pow(x, inlet.M) + ks * S
      : inlet.K * Math.pow(x, inlet.M);
    const sub = x => inlet.c * x * x + inlet.Y + ks * S;
    let r, zone;
    let zoneKey;
    if (X <= 3.5) { r = unsub(X); zoneKey = 'unsub'; }
    else if (X >= 4.0) { r = sub(X); zoneKey = 'sub'; }
    else { // vùng quá độ: nội suy tuyến tính giữa hai đường
      const u = inlet.form === 1 ? (Hc / D + inlet.K * Math.pow(3.5, inlet.M) + ks * S) : unsub(3.5);
      r = lerp(X, 3.5, 4.0, u, sub(4.0)); zoneKey = 'trans';
    }
    zone = { unsub: tr('không ngập', 'unsubmerged'), sub: tr('ngập', 'submerged'), trans: tr('quá độ', 'transition') }[zoneKey];
    return { HW: r * D, ratio: r, X, ks, dc, Hc, Vc, zone, zoneKey };
  }

  // Kiểm soát cửa ra — dòng chảy đầy (toán đồ D.7, D.8)
  function outletControl(cv, q, S, L, n, TW, ke) {
    const D = rise(cv), A = fullArea(cv), P = fullPerim(cv), R = A / P;
    const V = q / A;
    const kf = 2 * G * n * n * L / Math.pow(R, 4 / 3);
    const H = (1 + ke + kf) * V * V / (2 * G);
    const dc = criticalDepth(cv, q);
    const hoA = (dc + D) / 2;
    const ho = Math.max(TW, hoA);
    const HW = H + ho - L * S;
    return { HW, H, V, R, kf, ke, dc, ho, hoA, A };
  }

  function analyze(cv, Q, opt) {
    const N = cv.N || 1, q = Q / N;
    const inlet = inletById(cv.inlet);
    const n = cv.n || inlet.n || 0.013;
    const D = rise(cv);
    const ic = inletControl(cv, q, opt.S, inlet);
    const oc = outletControl(cv, q, opt.S, opt.L, n, opt.TW, inlet.ke);
    const control = ic.HW >= oc.HW ? 'inlet' : 'outlet';
    const HW = Math.max(ic.HW, oc.HW);
    // chiều sâu và vận tốc cửa ra
    let dout, how;
    if (control === 'inlet') {
      const nd = normalDepth(cv, q, n, opt.S);
      dout = nd.dn; how = nd.full ? tr('chảy đầy', 'flowing full') : tr('d₀ = d_n (chảy đều)', 'd₀ = d_n (normal depth)');
      if (opt.TW > dout && opt.TW < D) { dout = opt.TW; how = tr('d₀ = TW (mực nước hạ lưu cao hơn d_n)', 'd₀ = TW (tailwater above d_n)'); }
    } else {
      if (opt.TW >= D) { dout = D; how = 'TW ≥ D → d₀ = D'; }
      else if (opt.TW > oc.dc) { dout = opt.TW; how = 'd_c < TW < D → d₀ = TW'; }
      else { dout = oc.dc; how = 'TW ≤ d_c → d₀ = d_c'; }
    }
    const Ao = geom(cv, dout).A;
    const Vout = q / Ao;
    // chế độ chảy theo cách gọi quen thuộc ở Việt Nam
    let regime;
    let regKey;
    if (control === 'inlet') regKey = HW <= 1.2 * D ? 'free' : 'semi';
    else regKey = (oc.ho >= D || opt.TW >= D) ? 'press' : (HW > 1.2 * D ? 'semi' : 'free');
    regime = { free: tr('Không áp', 'Free-surface'), semi: tr('Bán áp', 'Partly pressurised'), press: tr('Có áp', 'Pressurised') }[regKey];
    return { cv, N, q, n, D, inlet, ic, oc, control, HW, ratio: HW / D, dout, how, Vout, regime, regKey };
  }

  // Đường quan hệ HW–Q của một cống (để vẽ "toán đồ" riêng cho phương án)
  function ratingCurve(cv, Qmax, opt, nPts = 40) {
    const out = [];
    for (let k = 1; k <= nPts; k++) {
      const Q = Qmax * k / nPts;
      const N = cv.N || 1, q = Q / N, inlet = inletById(cv.inlet), n = cv.n || inlet.n || 0.013;
      const ic = inletControl(cv, q, opt.S, inlet);
      const oc = outletControl(cv, q, opt.S, opt.L, n, typeof opt.TWfn === 'function' ? opt.TWfn(Q) : opt.TW, inlet.ke);
      out.push({ Q, HWi: ic.HW, HWo: oc.HW });
    }
    return out;
  }

  // Chiều sâu chảy đều kênh hạ lưu hình thang (để lấy TW)
  function channelNormalDepth(Q, b, m, n, S) {
    if (!(Q > 0 && n > 0 && S > 0)) return 0;
    const f = y => { const A = (b + m * y) * y, P = b + 2 * y * Math.sqrt(1 + m * m); return A * Math.pow(A / P, 2 / 3) * Math.sqrt(S) / n - Q; };
    return bisect(f, 1e-6, 20);
  }

  const CATALOG = {
    circ: [0.75, 1.0, 1.25, 1.5, 2.0],
    box: [[1.0,1.0],[1.5,1.5],[2.0,1.5],[2.0,2.0],[2.5,2.0],[2.5,2.5],[3.0,2.0],[3.0,2.5],[3.0,3.0],[3.5,3.0],[4.0,3.0],[4.0,4.0]]
  };

  function vcpLookup(id, depth) {
    const row = VCP.rows.find(r => r.id === id); if (!row) return null;
    let k = 0, best = 1e9;
    VCP.depths.forEach((d, i) => { const e = Math.abs(d - depth); if (e < best - 1e-9) { best = e; k = i; } });
    return { v: row.v[k], depth: VCP.depths[k], name: tr(row.name, row.en) };
  }

  // Đánh giá một phương án theo các điều kiện thiết kế
  function evaluate(cv, Q, opt) {
    const r = analyze(cv, Q, opt);
    const checks = [];
    const lim = opt.hwRatioMax || 1.2;
    checks.push({ key:'hwd', ok: r.ratio <= lim + 1e-9, text:`HW/D = ${fmt(r.ratio,2)} ${r.ratio <= lim ? '≤' : '>'} ${fmt(lim,2)}` });
    if (opt.HWmax > 0) checks.push({ key:'hwmax', ok: r.HW <= opt.HWmax + 1e-9, text:`HW = ${fmt(r.HW,2)} m ${r.HW <= opt.HWmax ? '≤' : '>'} ${tr('HW cho phép', 'allowable HW')} ${fmt(opt.HWmax,2)} m` });
    if (opt.vcpId) {
      const vc = vcpLookup(opt.vcpId, r.dout);
      r.vcp = vc;
      checks.push({ key:'v', ok: r.Vout <= vc.v + 1e-9, text:`${tr('V cửa ra', 'Outlet V')} = ${fmt(r.Vout,2)} m/s ${r.Vout <= vc.v ? '≤' : '>'} V_cp = ${fmt(vc.v,1)} m/s` });
    }
    r.checks = checks; r.ok = checks.every(c => c.ok);
    return r;
  }

  // Chiều dài cống phụ thuộc cao độ vai đường (do HW quyết định) → lặp điểm bất động
  // opt.Lfn(cv, r) trả về L mới; nếu không có thì dùng opt.L cố định.
  function evaluateL(cv, Q, opt) {
    if (typeof opt.Lfn !== 'function') { const r = evaluate(cv, Q, opt); r.L = opt.L; return r; }
    let L = opt.L, r;
    for (let k = 0; k < 6; k++) {
      r = evaluate(cv, Q, Object.assign({}, opt, { L }));
      const L2 = opt.Lfn(cv, r);
      if (Math.abs(L2 - L) < 0.005) { L = L2; break; }
      L = L2;
    }
    r = evaluate(cv, Q, Object.assign({}, opt, { L })); r.L = L;
    return r;
  }

  function selectCulverts(Q, opt) {
    const shapes = opt.shapes || ['circ', 'box'];
    const inletFor = { circ: opt.inletCirc || 'C-SQ', box: opt.inletBox || 'B-W30' };
    const maxN = opt.maxN || 3, list = [];
    if (shapes.includes('circ')) CATALOG.circ.filter(D => D >= (opt.minD || 0)).forEach(D => {
      for (let N = 1; N <= maxN; N++) list.push({ shape:'circ', D, N, inlet: inletFor.circ, n: opt.nCirc });
    });
    if (shapes.includes('box')) CATALOG.box.forEach(([B, H]) => {
      for (let N = 1; N <= maxN; N++) list.push({ shape:'box', B, H, N, inlet: inletFor.box, n: opt.nBox });
    });
    const res = list.map(cv => evaluateL(cv, Q, opt));
    res.forEach(r => { r.area = r.N * fullArea(r.cv); r.label = label(r.cv); });
    res.sort((a, b) => (b.ok - a.ok) || (a.area - b.area) || (a.N - b.N));
    return res;
  }
  function label(cv) {
    const n = cv.N > 1 ? cv.N + '×' : '';
    return cv.shape === 'circ' ? `${n}Φ${fmt(cv.D, 2)}` : `${n}${fmt(cv.B, 1)}×${fmt(cv.H, 1)}`;
  }

  function whyText(f) {
    if (LANG !== 'en') return f.why;
    return f.why.replace(/\(dịch dấu phẩy\)/g, '(decimal shift)').replace(/\(dấu phẩy\)/g, '(decimal point)')
      .replace(/\(đảo chữ số\)/g, '(transposed digits)').replace(/nằm giữa/g, 'between').replace(/ và /g, ' and ')
      .replace(/phải ≈ 0,97–0,99 lần/g, 'must be ≈ 0.97–0.99 ×').replace(/phải </g, 'must be <').replace(/phải >/g, 'must be >')
      .replace(/\(τsd=/g, '(τsd=').replace(/(\d),(\d)/g, '$1.$2');
  }
  const inletName = x => tr(x.name, x.en);
  function fmt(v, d = 2) {
    if (v == null || !isFinite(v)) return '—';
    const t = (+v).toFixed(d); return LANG === 'en' ? t : t.replace('.', ',');
  }

  root.CongCore = {
    RAW, REGIONS, REGION_NAMES, REGION_NAMES_EN, regionName, setLang, tr, whyText, inletName, getLang: () => LANG, MSD, MLS, VCP, INLETS, CATALOG, A1_COLS,
    soilFromSand, phiA1, tauSd, apA3, deltaB6, flood,
    geom, rise, fullArea, criticalDepth, normalDepth, inletControl, outletControl,
    analyze, evaluate, evaluateL, selectCulverts, ratingCurve, channelNormalDepth, vcpLookup, label, fmt, inletById,
    G, KU_INLET
  };
})(typeof window !== 'undefined' ? window : globalThis);
