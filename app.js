/* ========================================
   PERIO DX — app.js
   Decision tree logic + UI rendering
   ======================================== */

'use strict';

// ============================================================
// DATA — Decision Tree
// ============================================================

const TREE = {
  id: 'start',
  badge: 'Paso 1 · Evaluación inicial',
  pasoNum: 1,
  question: '¿El paciente tiene radiografías disponibles?',
  hint: 'Radiografías interproximales o panorámica reciente de buena calidad diagnóstica.',
  options: [
    {
      label: 'Sí, tiene radiografías',
      sub: 'Retro o panorámica disponible',
      icon: '🩻',
      color: 'blue',
      next: {
        id: 'rx_quality',
        badge: 'Paso 1 · Radiografías',
        pasoNum: 1,
        question: '¿Son de buena calidad diagnóstica?',
        hint: 'Retro o panorámica que permita evaluar el nivel óseo marginal interproximal.',
        options: [
          {
            label: 'Sí, buena calidad',
            sub: 'Permiten evaluar hueso marginal',
            icon: '✅',
            color: 'teal',
            next: {
              id: 'resorcion',
              badge: 'Paso 1 · Análisis radiográfico',
              pasoNum: 1,
              question: '¿Hay resorción ósea marginal detectable?',
              hint: 'Pérdida de hueso en cresta alveolar interproximal visible radiográficamente.',
              options: [
                {
                  label: 'Sí, hay resorción ósea marginal',
                  sub: 'Pérdida ósea visible en radiografía',
                  icon: '⚠️',
                  color: 'amber',
                  next: { _jump: 'sospecha_perio' }
                },
                {
                  label: 'No hay resorción ósea',
                  sub: 'Hueso marginal conservado',
                  icon: '✔️',
                  color: 'teal',
                  next: { _jump: 'examinar_pic_node' }
                }
              ]
            }
          },
          {
            label: 'No, calidad insuficiente',
            sub: 'No permiten evaluar el hueso',
            icon: '❌',
            color: 'amber',
            next: { _jump: 'examinar_pic_node' }
          }
        ]
      }
    },
    {
      label: 'No tiene radiografías',
      sub: 'Sin imágenes disponibles',
      icon: '📋',
      color: 'gray',
      next: { _jump: 'examinar_pic_node' }
    }
  ]
};

const NODES = {

  // ── PASO 1: PIC interproximal ──────────────────────────────
  examinar_pic_node: {
    id: 'examinar_pic_node',
    badge: 'Paso 1 · Examen clínico',
    pasoNum: 1,
    question: '¿Se detectó PIC (pérdida de inserción clínica) interproximal?',
    hint: 'Medición de la pérdida de inserción entre dientes adyacentes con la sonda periodontal.',
    options: [
      {
        label: 'Sí, hay PIC interproximal',
        sub: '',
        icon: '⚠️',
        color: 'amber',
        next: {
          id: 'pic_cara_libre',
          badge: 'Paso 1 · Extensión de PIC',
          pasoNum: 1,
          question: '¿La PIC en cara libre es ≥ 3mm?',
          hint: 'Cara libre: vestibular o palatino/lingual, no interproximal.',
          options: [
            {
              label: 'Sí, PIC ≥ 3mm en cara libre',
              sub: '',
              icon: '⚠️',
              color: 'red',
              next: { _jump: 'sospecha_perio' }
            },
            {
              label: 'No, PIC < 3mm en cara libre',
              sub: '',
              icon: '✔️',
              color: 'teal',
              next: { _jump: 'medir_bop_1_node' }
            }
          ]
        }
      },
      {
        label: 'No hay PIC interproximal',
        sub: 'Sin pérdida de inserción',
        icon: '✔️',
        color: 'teal',
        next: { _jump: 'medir_bop_1_node' }
      }
    ]
  },

  // ── PASO 1: BOP ────────────────────────────────────────────
  medir_bop_1_node: {
    id: 'medir_bop_1_node',
    badge: 'Paso 1 · Sangrado al sondaje',
    pasoNum: 1,
    question: '¿Cuál es el porcentaje de BOP?',
    hint: 'Porcentaje de sitios con sangrado al sondaje sobre el total explorado.',
    options: [
      {
        label: 'BOP < 10%',
        sub: 'Sangrado mínimo o ausente',
        icon: '🟢',
        color: 'teal',
        next: {
          id: 'res_salud',
          _result: true,
          badge: 'Resultado · Paso 1',
          pasoNum: 1,
          resultType: 'teal',
          resultTitle: 'Salud gingival',
          resultBody: 'El paciente presenta salud gingival clínica. Puede ser en periodonto íntegro o reducido estable (post-tratamiento). BOP < 10% confirma ausencia de inflamación significativa.',
          resultTags: ['BOP < 10%', 'Sin PIC relevante', 'Control anual'],
          resultNext: null
        }
      },
      {
        label: 'BOP ≥ 10%',
        sub: 'Sangrado significativo',
        icon: '🟡',
        color: 'amber',
        next: {
          id: 'ps_bop_alto',
          badge: 'Paso 1 · PS + BOP elevado',
          pasoNum: 1,
          question: '¿Hay PS ≥ 4mm en el mismo sitio con PIC?',
          hint: 'Profundidad de sondaje ≥ 4mm coincidente con el sitio de pérdida de inserción.',
          options: [
            {
              label: 'Sí, PS ≥ 4mm coincidente',
              sub: 'Bolsa periodontal presente',
              icon: '⚠️',
              color: 'red',
              next: { _jump: 'sospecha_perio' }
            },
            {
              label: 'No, PS < 4mm',
              sub: 'Sin bolsa en ese sitio',
              icon: '✔️',
              color: 'amber',
              next: {
                id: 'periodonto_reducido_bop',
                badge: 'Paso 1 · Periodonto reducido',
                pasoNum: 1,
                question: '¿Cuál es el BOP en el contexto de periodonto reducido?',
                hint: 'Paciente con periodonto previamente tratado o con recesiones sin bolsas activas.',
                options: [
                  {
                    label: 'BOP < 10%',
                    sub: '',
                    icon: '🟢',
                    color: 'teal',
                    next: {
                      id: 'res_salud_reducido',
                      _result: true,
                      badge: 'Resultado · Paso 1',
                      pasoNum: 1,
                      resultType: 'teal',
                      resultTitle: 'Salud gingival en periodonto reducido',
                      resultBody: 'Paciente con periodonto reducido (post-tratamiento o recesiones) sin inflamación activa. Continuar en mantenimiento periodontal.',
                      resultTags: ['Periodonto reducido', 'BOP < 10%', 'Mantenimiento'],
                      resultNext: null
                    }
                  },
                  {
                    label: 'BOP ≥ 10%',
                    sub: '',
                    icon: '🔴',
                    color: 'red',
                    next: {
                      id: 'gingivitis_extension',
                      badge: 'Paso 1 · Extensión de gingivitis',
                      pasoNum: 1,
                      question: '¿Qué porcentaje de dientes están afectados?',
                      hint: 'Cuente los dientes con sangrado al sondaje sobre el total de dientes presentes.',
                      options: [
                        {
                          label: '10–30% de dientes afectados',
                          sub: 'Gingivitis localizada',
                          icon: '🟡',
                          color: 'amber',
                          next: {
                            id: 'res_gin_loc_red',
                            _result: true,
                            badge: 'Resultado · Paso 1',
                            pasoNum: 1,
                            resultType: 'amber',
                            resultTitle: 'Gingivitis localizada en periodonto reducido',
                            resultBody: 'Inflamación gingival localizada (10–30% de sitios) en paciente con periodonto reducido previo. Tratar la causa local e instruir en higiene oral.',
                            resultTags: ['Gingivitis localizada', '10–30% sitios', 'Periodonto reducido'],
                            resultNext: null
                          }
                        },
                        {
                          label: '> 30% de dientes afectados',
                          sub: 'Gingivitis generalizada',
                          icon: '🔴',
                          color: 'red',
                          next: {
                            id: 'res_gin_gen_red',
                            _result: true,
                            badge: 'Resultado · Paso 1',
                            pasoNum: 1,
                            resultType: 'red',
                            resultTitle: 'Gingivitis generalizada en periodonto reducido',
                            resultBody: 'Inflamación gingival generalizada (> 30% de sitios) en periodonto reducido. Requiere instrucción intensiva de higiene y tartrectomía.',
                            resultTags: ['Gingivitis generalizada', '> 30% sitios', 'Periodonto reducido'],
                            resultNext: null
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  },

  // ── PASO 2: Sospecha periodontitis ─────────────────────────
  sospecha_perio: {
    id: 'sospecha_perio',
    badge: 'Paso 2 · Sospecha de periodontitis',
    pasoNum: 2,
    question: '¿La PIC detectada se debe a factores locales NO periodontales?',
    hint: 'Factores locales: caries cervical, restauraciones desbordantes, fractura radicular, endoperiodontitis, terceros molares impactados.',
    options: [
      {
        label: 'Sí, hay causa local identificable',
        sub: 'Factor no periodontal',
        icon: '🔍',
        color: 'blue',
        next: {
          id: 'pic_dientes_adyacentes',
          badge: 'Paso 2 · Distribución',
          pasoNum: 2,
          question: '¿La PIC está en 2 o más dientes no adyacentes?',
          hint: 'Si la pérdida de inserción no se explica por los factores locales identificados en dientes aislados.',
          options: [
            {
              label: 'Sí, ≥ 2 dientes no adyacentes con PIC',
              sub: 'Distribución sugestiva de periodontitis',
              icon: '⚠️',
              color: 'red',
              next: { _jump: 'paso2_confirmacion' }
            },
            {
              label: 'No, solo dientes adyacentes o aislados',
              sub: 'Probable causa local exclusiva',
              icon: '✔️',
              color: 'teal',
              next: {
                id: 'res_evaluar_gingivitis',
                _result: true,
                badge: 'Resultado · Paso 2',
                pasoNum: 2,
                resultType: 'blue',
                resultTitle: 'Evaluar como gingivitis y monitorear',
                resultBody: 'La PIC parece tener causa local. Trate el factor causal (caries, restauración, etc.) y monitoree la respuesta. Volver al Paso 1 en el siguiente control clínico.',
                resultTags: ['Causa local', 'Monitoreo', 'Volver a Paso 1'],
                resultNext: null
              }
            }
          ]
        }
      },
      {
        label: 'No hay causa local clara',
        sub: 'PIC de origen periodontal probable',
        icon: '⚠️',
        color: 'amber',
        next: { _jump: 'paso2_confirmacion' }
      }
    ]
  },

  // ── PASO 2: Confirmación ───────────────────────────────────
  paso2_confirmacion: {
    id: 'paso2_confirmacion',
    badge: 'Paso 2 · Confirmación',
    pasoNum: 2,
    question: '¿El paciente tiene tratamiento periodontal previo documentado?',
    hint: 'Historia clínica con periodontograma anterior o referencia a tratamiento previo.',
    options: [
      {
        label: 'Sí, tiene tratamiento periodontal previo',
        sub: 'Periodontitis tratada',
        icon: '📁',
        color: 'blue',
        next: {
          id: 'ps_revision',
          badge: 'Paso 2 · PS en revisión',
          pasoNum: 2,
          question: '¿Hay PS > 4mm (bolsas residuales 2–5mm)?',
          hint: 'Evalúe si hay bolsas residuales post-tratamiento que podrían indicar recidiva.',
          options: [
            {
              label: 'Sí, PS > 4mm presente',
              sub: 'Posible recidiva o bolsa residual',
              icon: '⚠️',
              color: 'red',
              next: {
                id: 'bop_revision',
                badge: 'Paso 2 · BOP en revisión',
                pasoNum: 2,
                question: '¿Hay BOP en el mismo sitio con PS > 4mm?',
                hint: 'Sangrado al sondaje en el sitio de la bolsa residual.',
                options: [
                  {
                    label: 'Sí, BOP en el mismo sitio',
                    sub: 'Periodontitis activa probable',
                    icon: '🔴',
                    color: 'red',
                    next: {
                      id: 'saco_verdadero',
                      badge: 'Paso 2 · Tipo de bolsa',
                      pasoNum: 2,
                      question: '¿Es saco verdadero o pseudosaco?',
                      hint: 'Saco verdadero: migración apical del epitelio de unión. Pseudosaco (closed pocket): epitelio de unión largo sin migración apical.',
                      options: [
                        {
                          label: 'Saco verdadero',
                          sub: 'Migración apical del epitelio de unión',
                          icon: '🔴',
                          color: 'red',
                          next: { _jump: 'caso_periodontitis' }
                        },
                        {
                          label: 'Pseudosaco (epitelio de unión largo)',
                          sub: 'Sin migración apical real',
                          icon: '🟡',
                          color: 'amber',
                          next: {
                            id: 'bop_revision2',
                            badge: 'Paso 2 · BOP revisión final',
                            pasoNum: 2,
                            question: '¿Cuál es el BOP global en revisión?',
                            hint: 'Evalúe el estado inflamatorio general del paciente en mantenimiento.',
                            options: [
                              {
                                label: 'BOP < 10%',
                                sub: '',
                                icon: '🟢',
                                color: 'teal',
                                next: {
                                  id: 'res_estable',
                                  _result: true,
                                  badge: 'Resultado · Paso 2',
                                  pasoNum: 2,
                                  resultType: 'teal',
                                  resultTitle: 'Salud gingival en paciente con periodontitis estable',
                                  resultBody: 'Paciente en mantenimiento con buena respuesta al tratamiento. Sin signos de actividad periodontal. Continuar controles periódicos.',
                                  resultTags: ['Periodontitis estable', 'BOP < 10%', 'Mantenimiento'],
                                  resultNext: null
                                }
                              },
                              {
                                label: 'BOP ≥ 10%',
                                sub: '',
                                icon: '🔴',
                                color: 'red',
                                next: {
                                  id: 'res_inflamacion_rev',
                                  _result: true,
                                  badge: 'Resultado · Paso 2',
                                  pasoNum: 2,
                                  resultType: 'amber',
                                  resultTitle: 'Inflamación gingival en paciente con periodontitis en revisión',
                                  resultBody: 'Paciente con periodontitis en mantenimiento pero con inflamación gingival activa. Requiere refuerzo de higiene y posible re-tratamiento de sitios activos.',
                                  resultTags: ['BOP ≥ 10%', 'Re-tratamiento', 'Refuerzo de higiene'],
                                  resultNext: null
                                }
                              }
                            ]
                          }
                        }
                      ]
                    }
                  },
                  {
                    label: 'No, sin BOP en ese sitio',
                    sub: 'Sin actividad inflamatoria local',
                    icon: '✔️',
                    color: 'teal',
                    next: {
                      id: 'res_verificar_pic',
                      _result: true,
                      badge: 'Resultado · Paso 2',
                      pasoNum: 2,
                      resultType: 'teal',
                      resultTitle: 'Verificar progresión de PIC',
                      resultBody: 'No hay sangrado activo, pero existe bolsa residual. Verifique que la pérdida de inserción no ha progresado comparando con registros previos.',
                      resultTags: ['Sin BOP', 'Verificar PIC', 'Monitoreo comparativo'],
                      resultNext: null
                    }
                  }
                ]
              }
            },
            {
              label: 'No, PS ≤ 4mm',
              sub: 'Sin bolsas residuales activas',
              icon: '✔️',
              color: 'teal',
              next: {
                id: 'res_perio_estable',
                _result: true,
                badge: 'Resultado · Paso 2',
                pasoNum: 2,
                resultType: 'teal',
                resultTitle: 'Periodontitis estable',
                resultBody: 'Paciente tratado sin bolsas residuales > 4mm. El tratamiento fue efectivo. Continuar en programa de mantenimiento periodontal activo.',
                resultTags: ['PS ≤ 4mm', 'Estable', 'Mantenimiento activo'],
                resultNext: null
              }
            }
          ]
        }
      },
      {
        label: 'No, sin tratamiento previo',
        sub: 'Caso nuevo de periodontitis',
        icon: '🆕',
        color: 'gray',
        next: { _jump: 'caso_periodontitis' }
      }
    ]
  },

  // ── PASO 3: Estadío ────────────────────────────────────────
  caso_periodontitis: {
    id: 'caso_periodontitis',
    badge: 'Paso 3 · Determinar Estadío',
    pasoNum: 3,
    question: '¿Cuál es la pérdida ósea radiográfica (ROM) o pérdida de inserción clínica (PIC) máxima?',
    hint: 'Evalúe el diente o sitio más comprometido del paciente para determinar el Estadío.',
    options: [
      {
        label: 'ROM en 1/3 coronal o PIC < 5mm',
        sub: 'Pérdida coronal: Estadío I o II probable',
        icon: '🟡',
        color: 'amber',
        next: {
          id: 'Estadío_1_2',
          badge: 'Paso 3 · Estadío I vs II',
          pasoNum: 3,
          question: '¿Hay alguno de los siguientes hallazgos?',
          hint: 'PS ≥ 5mm, lesiones de furca clase II o III, o dientes perdidos por periodontitis.',
          options: [
            {
              label: 'Sí: PS ≥ 5mm y/o furca clase II-III',
              sub: 'Complejidad moderada → Estadío II',
              icon: '2️⃣',
              color: 'blue',
              next: {
                id: 'rom_Estadío2',
                badge: 'Paso 3 · ROM exacto',
                pasoNum: 3,
                question: '¿Cuál es el ROM o PIC exacto del sitio más afectado?',
                hint: 'Seleccione el rango que corresponda al caso clínico.',
                options: [
                  {
                    label: 'ROM < 15% o PIC 1–2mm',
                    sub: 'Pérdida leve',
                    icon: '1️⃣',
                    color: 'teal',
                    next: {
                      id: 'res_Estadío1',
                      _result: true,
                      badge: 'Resultado · Paso 3 (Estadío)',
                      pasoNum: 3,
                      resultType: 'teal',
                      resultTitle: 'Periodontitis · Estadío I',
                      resultBody: 'Pérdida ósea < 15% o PIC 1–2mm. Sin factores de complejidad mayor. Buena respuesta esperada al tratamiento básico.',
                      resultTags: ['Estadío I', 'ROM < 15%', 'PIC 1–2mm', 'Sin complejidad mayor'],
                      resultNext: 'grado',
                      nextLabel: 'Continuar → Determinar Grado (Paso 4)'
                    }
                  },
                  {
                    label: 'ROM 15–33% o PIC 3–4mm',
                    sub: 'Pérdida moderada',
                    icon: '2️⃣',
                    color: 'blue',
                    next: {
                      id: 'res_Estadío2',
                      _result: true,
                      badge: 'Resultado · Paso 3 (Estadío)',
                      pasoNum: 3,
                      resultType: 'blue',
                      resultTitle: 'Periodontitis · Estadío II',
                      resultBody: 'Pérdida ósea 15–33% o PIC 3–4mm con complejidad moderada. Requiere instrumentación subgingival y posiblemente tratamiento quirúrgico.',
                      resultTags: ['Estadío II', 'ROM 15–33%', 'PIC 3–4mm'],
                      resultNext: 'grado',
                      nextLabel: 'Continuar → Determinar Grado (Paso 4)'
                    }
                  }
                ]
              }
            },
            {
              label: 'No hay esos hallazgos',
              sub: 'Sin complejidad → Estadío I',
              icon: '1️⃣',
              color: 'teal',
              next: {
                id: 'res_Estadío1b',
                _result: true,
                badge: 'Resultado · Paso 3 (Estadío)',
                pasoNum: 3,
                resultType: 'teal',
                resultTitle: 'Periodontitis · Estadío I',
                resultBody: 'ROM en 1/3 coronal sin complejidad adicional. Favorable pronóstico con tratamiento adecuado. Continuar a determinar el Grado.',
                resultTags: ['Estadío I', 'Sin complejidad', 'Buen pronóstico'],
                resultNext: 'grado',
                nextLabel: 'Continuar → Determinar Grado (Paso 4)'
              }
            }
          ]
        }
      },
      {
        label: 'ROM en 2/3 radiculares o PIC ≥ 5mm',
        sub: 'Pérdida severa: Estadío III o IV',
        icon: '🔴',
        color: 'red',
        next: {
          id: 'Estadío_3_4',
          badge: 'Paso 3 · Estadío III vs IV',
          pasoNum: 3,
          question: '¿Hay pérdida dental por periodontitis o colapso oclusal?',
          hint: '≥ 4 dientes perdidos por periodontitis, colapso de mordida, migración dentaria, menos de 10 pares oclusores, dientes en abanico.',
          options: [
            {
              label: '≥ 4 dientes perdidos + colapso oclusal',
              sub: 'Máxima complejidad → Estadío IV',
              icon: '4️⃣',
              color: 'red',
              next: {
                id: 'res_Estadío4',
                _result: true,
                badge: 'Resultado · Paso 3 (Estadío)',
                pasoNum: 3,
                resultType: 'red',
                resultTitle: 'Periodontitis · Estadío IV',
                resultBody: 'Máxima complejidad. Compromiso de la función masticatoria: colapso oclusal, migración dentaria, dientes en abanico o < 10 pares oclusores. Requiere tratamiento periodontal multidisciplinario.',
                resultTags: ['Estadío IV', 'Colapso oclusal', 'Función comprometida', 'Multidisciplinario'],
                resultNext: 'grado',
                nextLabel: 'Continuar → Determinar Grado (Paso 4)'
              }
            },
            {
              label: 'Menos de 4 dientes perdidos, sin colapso',
              sub: '→ Estadío III posible',
              icon: '3️⃣',
              color: 'amber',
              next: {
                id: 'Estadío3_extension',
                badge: 'Paso 3 · Extensión Estadío III',
                pasoNum: 3,
                question: '¿Cuántos dientes presentan pérdida de inserción correspondiente al Estadío?',
                hint: 'Localizado: < 30% del total de dientes. Generalizado: ≥ 30% del total de dientes.',
                options: [
                  {
                    label: '< 30% de dientes afectados',
                    sub: 'Estadío III · Localizado',
                    icon: '📍',
                    color: 'teal',
                    next: {
                      id: 'res_Estadío3_loc',
                      _result: true,
                      badge: 'Resultado · Paso 3 (Estadío)',
                      pasoNum: 3,
                      resultType: 'amber',
                      resultTitle: 'Periodontitis · Estadío III · Localizada',
                      resultBody: 'ROM en 2/3 radiculares o PIC ≥ 5mm con distribución localizada (< 30% de dientes). Requiere tratamiento activo y evaluación quirúrgica.',
                      resultTags: ['Estadío III', 'Localizada', '< 30% dientes'],
                      resultNext: 'grado',
                      nextLabel: 'Continuar → Determinar Grado (Paso 4)'
                    }
                  },
                  {
                    label: '≥ 30% de dientes afectados',
                    sub: 'Estadío III · Generalizado',
                    icon: '🌐',
                    color: 'red',
                    next: {
                      id: 'res_Estadío3_gen',
                      _result: true,
                      badge: 'Resultado · Paso 3 (Estadío)',
                      pasoNum: 3,
                      resultType: 'red',
                      resultTitle: 'Periodontitis · Estadío III · Generalizada',
                      resultBody: 'ROM en 2/3 radiculares o PIC ≥ 5mm con distribución generalizada (≥ 30% de dientes). Tratamiento intensivo requerido, evaluar factores sistémicos.',
                      resultTags: ['Estadío III', 'Generalizada', '≥ 30% dientes'],
                      resultNext: 'grado',
                      nextLabel: 'Continuar → Determinar Grado (Paso 4)'
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  },

  // ── PASO 4: Grado ──────────────────────────────────────────
  grado: {
    id: 'grado',
    badge: 'Paso 4 · Determinar Grado',
    pasoNum: 4,
    question: '¿Hay evidencia de progresión de la enfermedad en los últimos 5 años?',
    hint: 'Comparación de PIC o ROM con registros previos (radiografías o periodontogramas anteriores).',
    options: [
      {
        label: 'Sin evidencia de progresión',
        sub: '',
        icon: '⏸️',
        color: 'teal',
        next: {
          id: 'grado_ratio',
          badge: 'Paso 4 · Ratio pérdida/edad',
          pasoNum: 4,
          question: '¿Cuál es el ratio (pérdida ósea % / edad del paciente)?',
          hint: 'Divida el porcentaje de pérdida ósea del diente más comprometido entre la edad del paciente en años.',
          options: [
            {
              label: 'Ratio < 0.25',
              sub: 'Progresión muy lenta',
              icon: '🟢',
              color: 'teal',
              next: {
                id: 'res_grado_a',
                _result: true,
                badge: 'Diagnóstico Final · Completo',
                pasoNum: 4,
                resultType: 'teal',
                resultTitle: 'Periodontitis · Grado A',
                resultBody: 'Progresión lenta. Ratio pérdida ósea/edad < 0.25. Sin evidencia de factores modificadores sistémicos que aceleren la enfermedad. Buena respuesta esperada al tratamiento etiológico.',
                resultTags: ['Grado A', 'Progresión lenta', 'Ratio < 0.25', 'Bajo riesgo sistémico'],
                resultNext: null
              }
            },
            {
              label: 'Ratio 0.25 – 1.0',
              sub: 'Progresión moderada',
              icon: '🟡',
              color: 'amber',
              next: { _jump: 'grado_b_node' }
            },
            {
              label: 'Ratio > 1.0',
              sub: 'Progresión rápida',
              icon: '🔴',
              color: 'red',
              next: { _jump: 'grado_c_node' }
            }
          ]
        }
      },
      {
        label: 'Progresión < 2mm en 5 años',
        sub: 'Progresión moderada documentada',
        icon: '🟡',
        color: 'amber',
        next: { _jump: 'grado_b_node' }
      },
      {
        label: 'Progresión ≥ 2mm en 5 años',
        sub: 'Progresión rápida documentada',
        icon: '🔴',
        color: 'red',
        next: { _jump: 'grado_c_node' }
      }
    ]
  },

  // ── GRADO B ────────────────────────────────────────────────
  grado_b_node: {
    id: 'grado_b_node',
    badge: 'Paso 4 · Modificadores Grado B',
    pasoNum: 4,
    question: '¿El paciente tiene tabaquismo activo?',
    hint: 'El tabaquismo es el principal modificador del grado. Puede elevar de B a C según cantidad.',
    options: [
      {
        label: 'No fumador',
        sub: '',
        icon: '✔️',
        color: 'teal',
        next: {
          id: 'grado_b_diabetes',
          badge: 'Paso 4 · Diabetes (Grado B)',
          pasoNum: 4,
          question: '¿Tiene diabetes mellitus?',
          hint: 'La diabetes descontrolada es modificador de grado.',
          options: [
            {
              label: 'Sin diabetes',
              sub: '',
              icon: '✔️',
              color: 'teal',
              next: {
                id: 'res_grado_b',
                _result: true,
                badge: 'Diagnóstico Final · Completo',
                pasoNum: 4,
                resultType: 'blue',
                resultTitle: 'Periodontitis · Grado B',
                resultBody: 'Progresión moderada sin modificadores sistémicos relevantes. Responde al tratamiento periodontal convencional. Mantenimiento cada 3–4 meses.',
                resultTags: ['Grado B', 'Progresión moderada', 'No fumador', 'Sin DM'],
                resultNext: null
              }
            },
            {
              label: 'Diabetes con HbA1c < 7%',
              sub: 'Controlada',
              icon: '🩸',
              color: 'amber',
              next: {
                id: 'res_grado_b_dm',
                _result: true,
                badge: 'Diagnóstico Final · Completo',
                pasoNum: 4,
                resultType: 'blue',
                resultTitle: 'Periodontitis · Grado B (DM controlada)',
                resultBody: 'Grado B con diabetes bien controlada. La DM controlada no eleva el grado, pero requiere coordinación médico-odontológica y mantenimiento estricto.',
                resultTags: ['Grado B', 'DM controlada', 'HbA1c < 7%', 'Interconsulta médica'],
                resultNext: null
              }
            },
            {
              label: 'Diabetes con HbA1c ≥ 7%',
              sub: 'Descontrolada → eleva a Grado C',
              icon: '🔴',
              color: 'red',
              next: { _jump: 'res_grado_c_dm' }
            }
          ]
        }
      },
      {
        label: 'Fumador < 10 cigarrillos/día',
        sub: 'Tabaquismo leve',
        icon: '🚬',
        color: 'amber',
        next: {
          id: 'res_grado_b_tab',
          _result: true,
          badge: 'Diagnóstico Final · Completo',
          pasoNum: 4,
          resultType: 'blue',
          resultTitle: 'Periodontitis · Grado B (tabaquismo leve)',
          resultBody: 'Grado B. El tabaquismo < 10 cig/día no eleva automáticamente a Grado C, pero es factor de riesgo significativo. Cesación tabáquica prioritaria.',
          resultTags: ['Grado B', '< 10 cig/día', 'Cesación tabáquica urgente'],
          resultNext: null
        }
      },
      {
        label: 'Fumador ≥ 10 cigarrillos/día',
        sub: 'Tabaquismo significativo → eleva a Grado C',
        icon: '🚭',
        color: 'red',
        next: {
          id: 'res_grado_c_tab',
          _result: true,
          badge: 'Diagnóstico Final · Completo',
          pasoNum: 4,
          resultType: 'red',
          resultTitle: 'Periodontitis · Grado C (modificado por tabaquismo)',
          resultBody: 'Tabaquismo ≥ 10 cig/día modifica el grado a C. Peor pronóstico y respuesta reducida al tratamiento. Cesación tabáquica es parte esencial del tratamiento. Derivar a programa de apoyo.',
          resultTags: ['Grado C', 'Tabaquismo ≥ 10 cig/día', 'Modificado', 'Cesación urgente'],
          resultNext: null
        }
      }
    ]
  },

  // ── GRADO C ────────────────────────────────────────────────
  grado_c_node: {
    id: 'grado_c_node',
    badge: 'Paso 4 · Confirmación Grado C',
    pasoNum: 4,
    question: '¿Tiene diabetes mellitus activa?',
    hint: 'La diabetes es el principal modificador sistémico para Grado C.',
    options: [
      {
        label: 'Sin diabetes',
        sub: '',
        icon: '✔️',
        color: 'teal',
        next: {
          id: 'res_grado_c',
          _result: true,
          badge: 'Diagnóstico Final · Completo',
          pasoNum: 4,
          resultType: 'red',
          resultTitle: 'Periodontitis · Grado C',
          resultBody: 'Progresión rápida confirmada. Alto riesgo de pérdida dental. Requiere tratamiento periodontal intensivo y frecuentes controles de mantenimiento (cada 1–2 meses inicialmente).',
          resultTags: ['Grado C', 'Progresión rápida', 'Alto riesgo', 'Tratamiento intensivo'],
          resultNext: null
        }
      },
      {
        label: 'Diabetes con HbA1c < 7%',
        sub: 'Controlada',
        icon: '🩸',
        color: 'amber',
        next: {
          id: 'res_grado_c_dm_ctrl',
          _result: true,
          badge: 'Diagnóstico Final · Completo',
          pasoNum: 4,
          resultType: 'red',
          resultTitle: 'Periodontitis · Grado C (DM controlada)',
          resultBody: 'Grado C con diabetes controlada. Mantener coordinación estrecha con médico tratante. El control glucémico estricto mejora la respuesta al tratamiento periodontal.',
          resultTags: ['Grado C', 'DM controlada', 'HbA1c < 7%', 'Interconsulta médica'],
          resultNext: null
        }
      },
      {
        label: 'Diabetes con HbA1c ≥ 7%',
        sub: 'Descontrolada',
        icon: '🔴',
        color: 'red',
        next: { _jump: 'res_grado_c_dm' }
      }
    ]
  },

  // ── RESULTADO FINAL: Grado C + DM descontrolada ───────────
  res_grado_c_dm: {
    id: 'res_grado_c_dm',
    _result: true,
    badge: 'Diagnóstico Final · Completo',
    pasoNum: 4,
    resultType: 'red',
    resultTitle: 'Periodontitis · Grado C (DM descontrolada)',
    resultBody: 'Máximo riesgo. La diabetes descontrolada (HbA1c ≥ 7%) modifica el diagnóstico a Grado C. Derivación urgente a médico internista para optimizar el control glucémico. El tratamiento periodontal debe coordinarse con el manejo sistémico.',
    resultTags: ['Grado C', 'DM descontrolada', 'HbA1c ≥ 7%', 'Derivación urgente', 'Interconsulta médica'],
    resultNext: null
  }
};

// ============================================================
// STATE
// ============================================================

const state = {
  history: [],
  current: null,
  phasesCompleted: new Set()
};

// ============================================================
// UTILS
// ============================================================

function resolveNode(raw) {
  if (!raw) return null;
  if (raw._jump) return NODES[raw._jump] || null;
  if (raw._result) return raw;
  if (raw.options) return raw;
  return null;
}

function getColorVars(type) {
  const map = {
    teal:   { c1: 'var(--teal)',   c2: 'var(--accent)',  glow: 'var(--teal-bg)',   text: 'var(--teal)' },
    blue:   { c1: 'var(--blue)',   c2: 'var(--teal)',    glow: 'var(--blue-bg)',   text: 'var(--blue)' },
    amber:  { c1: 'var(--amber)',  c2: 'var(--red)',     glow: 'var(--amber-bg)',  text: 'var(--amber)' },
    red:    { c1: 'var(--red)',    c2: 'var(--amber)',   glow: 'var(--red-bg)',    text: 'var(--red)' },
    purple: { c1: 'var(--purple)', c2: 'var(--blue)',    glow: 'var(--purple-bg)', text: 'var(--purple)' },
    gray:   { c1: 'var(--gray)',   c2: 'var(--text-2)',  glow: 'var(--gray-bg)',   text: 'var(--gray)' }
  };
  return map[type] || map.gray;
}

function calcProgress() {
  const depth = state.history.length;
  return Math.min(Math.round((depth / 14) * 100), 95);
}

function updateProgress(pct) {
  document.getElementById('sidebar-prog').style.width = pct + '%';
  document.getElementById('sidebar-pct').textContent = pct + '%';
  const mob = document.getElementById('mobile-prog');
  if (mob) mob.style.width = pct + '%';
}

// ============================================================
// SIDEBAR
// ============================================================

const STEP_DEFS = [
  { num: 1, label: 'Evaluación inicial' },
  { num: 2, label: 'Sospecha de periodontitis' },
  { num: 3, label: 'Estadío (I–IV)' },
  { num: 4, label: 'Grado (A–C)' }
];

function renderSidebar(activeNum) {
  const wrap = document.getElementById('sidebar-steps');
  const mobileWrap = document.getElementById('mobile-nav');
  if (!wrap) return;

  const maxReached = Math.max(...Array.from(state.history.map(n => n.pasoNum || 1)), activeNum || 1);

  const html = STEP_DEFS.map(s => {
    const isDone   = s.num < activeNum || state.phasesCompleted.has(s.num);
    const isActive = s.num === activeNum;
    let cls = 'step-item';
    if (isDone)   cls += ' step-item--done';
    if (isActive) cls += ' step-item--active';

    const dotContent = isDone
      ? `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : s.num;

    return `<div class="${cls}">
      <div class="step-item__dot">${dotContent}</div>
      <div class="step-item__text">Paso ${s.num} · ${s.label}</div>
    </div>`;
  }).join('');

  wrap.innerHTML = html;
  if (mobileWrap) mobileWrap.innerHTML = html;

  const done = Math.max(0, (activeNum || 1) - 1);
  document.getElementById('sidebar-count').textContent = `${done} / 4`;
}

// ============================================================
// BREADCRUMB
// ============================================================

function renderBreadcrumb() {
  const shown = state.history.slice(-3);
  if (shown.length === 0) return '';

  return `<div class="breadcrumb">
    ${shown.map((n, i) => `
      <span class="crumb ${i === shown.length - 1 ? 'crumb--current' : ''}">
        ${i > 0 ? '<span class="crumb__sep">›</span>' : ''}
        <span class="crumb__label">${n.badge || 'Paso'}</span>
      </span>`).join('')}
  </div>`;
}

// ============================================================
// RENDER: Question
// ============================================================

function renderQuestion(node) {
  const area   = document.getElementById('card-area');
  const back   = document.getElementById('back-area');
  const pct    = calcProgress();

  updateProgress(pct);
  renderSidebar(node.pasoNum || 1);

  const opts = node.options.map((o, i) => {
    const nextData = JSON.stringify(o.next).replace(/"/g, '&quot;');
    return `
      <button class="opt-btn opt-btn--${o.color}"
              onclick="handleChoice('${encodeURIComponent(JSON.stringify(o.next))}')"
              style="animation-delay:${i * 0.06}s">
        <div class="opt-icon opt-icon--${o.color}">${o.icon}</div>
        <div class="opt-body">
          <div class="opt-label">${o.label}</div>
          ${o.sub ? `<div class="opt-sub">${o.sub}</div>` : ''}
        </div>
        <div class="opt-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </button>`;
  }).join('');

  area.innerHTML = `
    <div class="q-card">
      ${renderBreadcrumb()}
      <div class="q-header">
        <div class="q-badge">${node.badge || ''}</div>
        <div class="q-title">${node.question}</div>
        ${node.hint ? `<div class="q-hint">${node.hint}</div>` : ''}
      </div>
      <div class="opts-grid">${opts}</div>
    </div>`;

  back.style.display = state.history.length > 0 ? 'block' : 'none';
}

// ============================================================
// RENDER: Result
// ============================================================

function renderResult(node) {
  const area = document.getElementById('card-area');
  const back = document.getElementById('back-area');

  updateProgress(100);
  document.getElementById('sidebar-prog').style.width = '100%';
  document.getElementById('sidebar-pct').textContent = '100%';

  if (node.pasoNum) state.phasesCompleted.add(node.pasoNum);
  renderSidebar(node.pasoNum || 4);

  const cv   = getColorVars(node.resultType || 'gray');
  const tags = (node.resultTags || []).map(t =>
    `<span class="tag tag--${node.resultType || 'gray'}">${t}</span>`
  ).join('');

  let continueBtn = '';
  if (node.resultNext && NODES[node.resultNext]) {
    continueBtn = `
      <button class="btn-continue" onclick="jumpTo('${node.resultNext}')">
        ${node.nextLabel || 'Continuar'}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>`;
  }

  area.innerHTML = `
    <div class="result-card">
      ${renderBreadcrumb()}
      <div class="result-hero"
           style="--r-color1:${cv.c1}; --r-color2:${cv.c2}; --r-glow:${cv.glow}">
        <div class="result-eyebrow" style="color:${cv.text}">${node.badge || 'Resultado'}</div>
        <div class="result-title">${node.resultTitle}</div>
        <div class="result-body">${node.resultBody}</div>
        <div class="result-tags">${tags}</div>
      </div>
      <div class="result-actions">
        ${continueBtn}
        <button class="btn-restart-result" onclick="restartDiagnosis()">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7a5 5 0 1 0 1.5-3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            <path d="M2 3.5V7h3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Nuevo diagnóstico
        </button>
      </div>
    </div>`;

  back.style.display = 'block';
}

// ============================================================
// NAVIGATION
// ============================================================

function render(raw) {
  const node = resolveNode(raw);
  if (!node) { console.warn('Node not found:', raw); return; }

  state.current = node;

  if (node._result) {
    renderResult(node);
  } else {
    renderQuestion(node);
  }

  // Close mobile menu
  closeMobileMenu();
}

function handleChoice(encoded) {
  const raw = JSON.parse(decodeURIComponent(encoded));
  state.history.push(state.current);
  render(raw);
}

function goBack() {
  if (state.history.length === 0) return;
  const prev = state.history.pop();
  render(prev);
}

function jumpTo(id) {
  if (!NODES[id]) { console.warn('jumpTo: node not found:', id); return; }
  state.history.push(state.current);
  render(NODES[id]);
}

function restartDiagnosis() {
  state.history = [];
  state.phasesCompleted.clear();
  render(TREE);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// MOBILE MENU
// ============================================================

function toggleMobileMenu() {
  const drawer = document.getElementById('mobile-drawer');
  const btn    = document.getElementById('menu-btn');
  drawer.classList.toggle('is-open');
  btn.classList.toggle('is-open');
}

function closeMobileMenu() {
  document.getElementById('mobile-drawer')?.classList.remove('is-open');
  document.getElementById('menu-btn')?.classList.remove('is-open');
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  render(TREE);
});