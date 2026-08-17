
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Student, WeeklyPlan, MuscleGroup, NutriPlan, YogaPlan, ProgressEntry, Exercise, SportsPlan, CalisthenicsPlan, TrainerProfile } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const cleanJSON = (text: string) => {
  if (!text) return "{}";
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return text.substring(firstBrace, lastBrace + 1);
    }
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
  } catch (e) {
    return "{}";
  }
};

export const generateWorkoutPlan = async (student: Student, notes: string): Promise<WeeklyPlan | null> => {
  if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) return null;
  const ai = getAI();
  const prompt = `Atue como Personal Trainer Master. Gere um treino semanal completo de 7 dias (Segunda a Domingo) em JSON para ${student.name}.
    Objetivo: ${student.goal}. Nível: ${student.level}. Restrições: ${student.restrictions}. 
    Notas Adicionais: ${notes}. 
    Importante: Mapeie os exercícios para um destes grupos: ${Object.values(MuscleGroup).join(', ')}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayOfWeek: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        muscleGroup: { type: Type.STRING },
                        sets: { type: Type.NUMBER },
                        reps: { type: Type.STRING },
                        notes: { type: Type.STRING },
                      },
                      required: ["name", "muscleGroup", "sets", "reps"]
                    }
                  }
                },
                required: ["dayOfWeek", "focus", "exercises"]
              }
            }
          },
          required: ["days"]
        }
      }
    });

    const jsonStr = cleanJSON(response.text || "{}");
    const data = JSON.parse(jsonStr);
    
    return {
      days: data.days.map((day: any, dIdx: number) => ({
        dayOfWeek: day.dayOfWeek,
        focus: day.focus,
        exercises: (day.exercises || []).map((ex: any, eIdx: number) => ({
          ...ex,
          id: `ai-ex-${Date.now()}-${dIdx}-${eIdx}`,
          videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " execucao musculacao")}`
        }))
      }))
    };
  } catch (e) {
    console.error("Workout generation error:", e);
    return null;
  }
};

export const generateNutriPlan = async (student: Student, notes: string): Promise<NutriPlan | null> => {
  if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) return null;
  const ai = getAI();
  const prompt = `Gere um plano alimentar estratégico de 7 dias para ${student.name}. 
  Objetivo: ${student.goal}. Peso: ${student.weight}kg. Altura: ${student.height}cm. Notas: ${notes}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeklyMeals: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  dayOfWeek: { type: Type.STRING }, 
                  meals: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: { 
                        time: { type: Type.STRING }, 
                        label: { type: Type.STRING }, 
                        description: { type: Type.STRING } 
                      } 
                    } 
                  } 
                } 
              } 
            },
            recipes: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  name: { type: Type.STRING }, 
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                  instructions: { type: Type.STRING }, 
                  macros: { 
                    type: Type.OBJECT, 
                    properties: { 
                      protein: { type: Type.NUMBER }, 
                      carbs: { type: Type.NUMBER }, 
                      fats: { type: Type.NUMBER }, 
                      calories: { type: Type.NUMBER } 
                    } 
                  } 
                } 
              } 
            },
            shoppingList: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, category: { type: Type.STRING } } } },
            dailyMacrosTarget: { type: Type.OBJECT, properties: { protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fats: { type: Type.NUMBER }, calories: { type: Type.NUMBER } } }
          }
        }
      }
    });

    const data = JSON.parse(cleanJSON(response.text || "{}"));
    return {
      ...data,
      recipes: data.recipes.map((r: any, i: number) => ({ ...r, id: `recipe-${i}` })),
      shoppingList: data.shoppingList.map((s: any) => ({ ...s, checked: false }))
    };
  } catch (e) {
    console.error("Nutri generation error:", e);
    return null;
  }
};

export const generateCalisthenicsPlan = async (student: Student, focusSkill: string, details: string): Promise<CalisthenicsPlan | null> => {
  if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) return null;
  const ai = getAI();
  const prompt = `Gere rotina de calistenia focada em ${focusSkill} para nível ${student.level}. 
  Restrições: ${student.restrictions}. Detalhes: ${details}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING },
            focusSkill: { type: Type.STRING },
            routine: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.NUMBER },
                        reps: { type: Type.STRING },
                        progression: { type: Type.STRING },
                        videoSearchQuery: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    const data = JSON.parse(cleanJSON(response.text || "{}"));
    return { ...data, generatedAt: new Date().toLocaleDateString('pt-BR') };
  } catch(e) {
    console.error(e);
    return null;
  }
};

// Fix: Implemented generateYogaPlan
export const generateYogaPlan = async (student: Student, focus: string, duration: number): Promise<YogaPlan | null> => {
  if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) return null;
  const ai = getAI();
  const prompt = `Gere uma rotina de Yoga para ${student.name}. Foco: ${focus}. Duração: ${duration} min. Nível: ${student.level}.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            level: { type: Type.STRING },
            duration: { type: Type.NUMBER },
            poses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING },
                  benefits: { type: Type.STRING },
                },
                required: ["name", "duration", "description", "benefits"]
              }
            }
          },
          required: ["name", "level", "duration", "poses"]
        }
      }
    });
    const data = JSON.parse(cleanJSON(response.text || "{}"));
    return { ...data, generatedAt: new Date().toLocaleDateString('pt-BR') };
  } catch (e) {
    console.error(e);
    return null;
  }
};

// Fix: Implemented generateProgressInsights
export const generateProgressInsights = async (student: Student, entry: ProgressEntry): Promise<string> => {
  if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) return "Análise indisponível no momento.";
  const ai = getAI();
  const prompt = `Analise a evolução de ${student.name}. Peso: ${entry.weight}kg. Medidas: ${JSON.stringify(entry.measurements)}. Objetivo: ${student.goal}. Dê insights curtos e motivadores.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
    });
    return response.text || "Continue focado no seu objetivo!";
  } catch (e) {
    return "Excelente progresso, mantenha a constância!";
  }
};

// Fix: Implemented generateMeditationAudio
export const generateMeditationAudio = async (text: string): Promise<string | null> => {
  if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) return null;
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Diga com voz calma e meditativa: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// Fix: Implemented generateMeditationTips
export const generateMeditationTips = async (student: Student): Promise<string> => {
  if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) return "";
  const ai = getAI();
  const prompt = `Dê 3 dicas curtas e práticas de meditação e foco mental para um aluno com objetivo de ${student.goal}.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
    });
    return response.text || "Respire fundo e mantenha o foco.";
  } catch (e) {
    return "Foco na respiração e consistência diária.";
  }
};

// Fix: Implemented generateExerciseNote
export const generateExerciseNote = async (exerciseName: string, studentGoal: string): Promise<string> => {
  if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) return "";
  const ai = getAI();
  const prompt = `Dê uma dica rápida de execução ou biomecânica para o exercício ${exerciseName} focando em ${studentGoal}. Máximo 20 palavras.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
    });
    return response.text || "Mantenha a postura correta e contração máxima.";
  } catch (e) {
    return "Foque na técnica e controle do movimento.";
  }
};

// Fix: Implemented generateSportsPlan
export const generateSportsPlan = async (student: Student, sport: string, details: string): Promise<SportsPlan | null> => {
  if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) return null;
  const ai = getAI();
  const prompt = `Gere um plano de treinamento esportivo para ${sport}. Atleta: ${student.name}. Objetivo: ${student.goal}. Detalhes extras: ${details}.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sport: { type: Type.STRING },
            weeklySchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  drills: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        description: { type: Type.STRING },
                        videoSearchQuery: { type: Type.STRING }
                      },
                      required: ["name", "duration", "description", "videoSearchQuery"]
                    }
                  }
                },
                required: ["day", "focus", "drills"]
              }
            }
          },
          required: ["sport", "weeklySchedule"]
        }
      }
    });
    const data = JSON.parse(cleanJSON(response.text || "{}"));
    return { ...data, id: `sports-${Date.now()}`, generatedAt: new Date().toLocaleDateString('pt-BR') };
  } catch (e) {
    console.error(e);
    return null;
  }
};

// Fix: Implemented generateAssessmentReport
export const generateAssessmentReport = async (student: Student): Promise<string> => {
  if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) return "Relatório indisponível.";
  const ai = getAI();
  const prompt = `Gere um relatório de avaliação física resumido para ${student.name}. Idade: ${student.age}, Altura: ${student.height}cm, Peso: ${student.weight}kg, Objetivo: ${student.goal}. Destaque pontos fortes e recomendações.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
    });
    return response.text || "Relatório gerado com sucesso.";
  } catch (e) {
    return "Erro ao processar avaliação.";
  }
};

// Fix: Implemented generateTrainerBio
export const generateTrainerBio = async (trainerForm: Partial<TrainerProfile>): Promise<string> => {
  if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) return trainerForm.bio || "";
  const ai = getAI();
  const prompt = `Crie uma bio profissional curta e impactante para um Personal Trainer chamado ${trainerForm.name}. Título: ${trainerForm.title}. Estilo: Inspirador e focado em alta performance.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
    });
    return response.text || trainerForm.bio || "";
  } catch (e) {
    return trainerForm.bio || "";
  }
};
