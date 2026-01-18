import React, { useState, useEffect, useRef } from 'react';
import {
  User, Code, Palette, Gamepad2, Database, Users, Plus, Save, ExternalLink, X,
  Mail, ShieldCheck, Send, Lock, Loader2, CheckCircle2, AtSign, Bug, Megaphone, PenTool,
  Briefcase, TrendingUp, DollarSign, Award, MapPin, MessageSquare, Wrench, Monitor, Globe,
  Github, Linkedin, Twitter, Instagram, Search, Filter, Clock, Languages,
  Brush, Layers, Wand2, MessageCircle, Phone
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { supabase } from './supabase';

/**
 * --- EMAILJS ENTEGRASYON AYARLARI ---
 * Güvenlik Notu: Public Key'inizi asla GitHub gibi herkese açık yerlere yüklemeyin.
 */
const EMAIL_CONFIG = {
  // Geliştirme aşamasında 'true' yapın, canlıya alırken 'false' yapın.
  // 'false' olduğunda gerçek mail atar (Public Key girilmişse).
  USE_MOCK: false,

  SERVICE_ID: 'service_5sdj2ym', // Kullanıcı tarafından sağlanan Service ID
  TEMPLATE_ID: 'template_x6ojo35',   // Kullanıcı tarafından sağlanan Template ID

  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
};

// --- DATA CONSTANTS ---

const ROLES = [
  { id: 'all', label: 'Tümü', icon: <Users size={16} />, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  { id: 'dev', label: 'Yazılım', icon: <Code size={16} />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'art', label: 'Sanat', icon: <Palette size={16} />, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { id: 'design', label: 'Tasarım', icon: <Gamepad2 size={16} />, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'sound', label: 'Ses', icon: <User size={16} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { id: 'prod', label: 'Prod.', icon: <Database size={16} />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { id: 'qa', label: 'QA', icon: <Bug size={16} />, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { id: 'marketing', label: 'Pazarlama', icon: <Megaphone size={16} />, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { id: 'writer', label: 'Yazar', icon: <PenTool size={16} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { id: 'biz', label: 'BizDev', icon: <TrendingUp size={16} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { id: 'investor', label: 'Yatırımcı', icon: <Briefcase size={16} />, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  // New Roles
  { id: 'community', label: 'Topluluk', icon: <MessageCircle size={16} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { id: 'concept_art', label: 'Konsept Sanat', icon: <Brush size={16} />, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' },
  { id: 'level_design', label: 'Bölüm Tasarımı', icon: <Layers size={16} />, color: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/20' },
  { id: 'vfx', label: 'VFX', icon: <Wand2 size={16} />, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { id: 'localization', label: 'Yerelleştirme', icon: <Languages size={16} />, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
];

const LEVELS = [
  { id: 'student', label: 'Öğrenci / Stajyer' },
  { id: 'junior', label: 'Junior (Başlangıç)' },
  { id: 'mid', label: 'Mid-Level (Orta)' },
  { id: 'senior', label: 'Senior (Kıdemli)' },
  { id: 'lead', label: 'Lead / Direktör' },
  { id: 'founder', label: 'Stüdyo Kurucusu' },
  { id: 'investor', label: 'Yatırımcı / VC' },
];

const WORK_STATUSES = [
  { id: 'open', label: 'İş / Proje Arıyor', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
  { id: 'freelance', label: 'Freelance Açık', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  { id: 'hiring', label: 'Ekip Arkadaşı Arıyor', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { id: 'employed', label: 'Çalışıyor (Kapalı)', color: 'text-slate-400 border-slate-500/30 bg-slate-500/10' },
  { id: 'investing', label: 'Yatırım Yapıyor', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
];

const AVAILABILITY = [
  { id: 'full', label: 'Full-time' },
  { id: 'part', label: 'Part-time (20h+)' },
  { id: 'side', label: 'Haftasonu / Hobi (<10h)' },
  { id: 'project', label: 'Proje Bazlı' },
];

const POPULAR_ENGINES = ["Unity", "Unreal Engine", "Godot", "Gamemaker", "Custom Engine", "Construct", "Roblox"];
const POPULAR_TOOLS = ["Blender", "Maya", "3ds Max", "ZBrush", "Photoshop", "Substance", "FMOD", "Wwise", "Jira", "GitHub", "Figma"];
const GENRES = ["RPG", "FPS/TPS", "Hypercasual", "Strategy", "Puzzle", "Simulation", "Metroidvania", "Visual Novel", "VR/AR", "MMO", "Roguelike"];

const INITIAL_DATA = [
  {
    id: 1715692000001,
    name: "Ada Lovelace",
    role: ["dev", "math"], // Converted to array for backward compatibility support logic
    level: "senior",
    workStatus: "freelance",
    availability: "full",
    location: "İstanbul, TR",
    languages: "TR, EN",
    discord: "ada_dev#1234",
    socials: { github: "https://github.com", linkedin: "https://linkedin.com" },
    engines: ["Unity", "Custom Engine"],
    genres: ["Simulation", "Strategy"],
    skills: "C#, Shader Graph, Optimization, Math",
    bio: "Gameplay programlama ve fizik motorları üzerine yoğunlaşıyorum. Matematik kökenliyim.",
    email: "ada@gamedev.net",
  },
  {
    id: 1715692000002,
    name: "Hideo K.",
    role: ["design", "writer"],
    level: "lead",
    workStatus: "hiring",
    availability: "project",
    location: "Remote / Tokyo",
    languages: "JP, EN",
    discord: "hideogames#0001",
    socials: { twitter: "https://twitter.com", artstation: "https://artstation.com" },
    engines: ["Unreal Engine"],
    genres: ["RPG", "Cinematic"],
    skills: "Level Design, Narrative, World Building",
    bio: "Sinematik deneyimler ve karmaşık hikayeler yaratacak ekip arkadaşları arıyorum.",
    email: "hideo@kojima.jp",
  },
  {
    id: 1715692000003,
    name: "Bruce W.",
    role: ["investor"],
    level: "investor",
    workStatus: "investing",
    availability: "side",
    location: "Gotham / US",
    languages: "EN",
    discord: "bruce_way#9999",
    socials: { linkedin: "https://linkedin.com" },
    engines: [],
    genres: ["VR/AR", "Tech Demo"],
    skills: "Finans, Strateji, Networking, Pre-Seed",
    bio: "Erken aşama oyun stüdyolarına tohum yatırımı yapıyorum. Teknoloji odaklı projelere ilgim var.",
    email: "bruce@wayne-ent.com",
    investmentBudget: "50k$ - 250k$"
  }
];

/**
 * SERVICE LAYER
 */
const EmailService = {
  isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

  sendVerificationCode: async (userEmail, userName, code) => {
    try {
      const templateParams = {
        email: userEmail,
        title: userName,
        message: code
      };

      console.log("EmailJS servisine bağlanılıyor...", templateParams);

      const response = await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAIL_CONFIG.PUBLIC_KEY
      );

      if (response && (response.status === 200 || response.text === 'OK')) {
        console.log('E-posta başarıyla gönderildi!', response);
        return { success: true, serverCode: code };
      }
      throw new Error("EmailJS status error");
    } catch (error) {
      console.error("EMAILJS HATASI:", error);
      alert("E-posta gönderilemedi, lütfen tekrar deneyin.");
      return { success: false };
    }
  }
};

/**
 * UI COMPONENTS
 */
const OtpInput = ({ length = 4, onComplete, resetTrigger }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => { if (inputRefs.current[0]) inputRefs.current[0].focus(); }, []);
  useEffect(() => { setOtp(new Array(length).fill("")); if (inputRefs.current[0]) inputRefs.current[0].focus(); }, [resetTrigger]);

  const handleChange = (index, e) => {
    const value = e.target.value; if (isNaN(value)) return;
    const newOtp = [...otp]; newOtp[index] = value.substring(value.length - 1); setOtp(newOtp);
    const combinedOtp = newOtp.join(""); if (combinedOtp.length === length) onComplete(combinedOtp);
    if (value && index < length - 1 && inputRefs.current[index + 1]) inputRefs.current[index + 1].focus();
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) inputRefs.current[index - 1].focus();
  };

  return (
    <div className="flex gap-2 justify-center my-3">
      {otp.map((value, index) => (
        <input key={index} ref={(input) => (inputRefs.current[index] = input)} type="text" inputMode="numeric" maxLength={1} value={value} onChange={(e) => handleChange(index, e)} onKeyDown={(e) => handleKeyDown(index, e)} className="w-10 h-12 bg-slate-900 border border-indigo-500/30 rounded-lg text-center text-lg font-bold text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
      ))}
    </div>
  );
};


const StickyFooter = ({ onExport }) => (
  <footer className="fixed bottom-0 left-0 w-full z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/50 py-3 px-6">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-6">
        <p className="text-[11px] text-slate-400 font-medium">© 2026 IGD Community Platform</p>
        <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>
        <a
          href="https://wa.me/905373420161"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-all hover:scale-105"
        >
          <MessageCircle size={14} className="text-green-500" />
          PROFESYONEL İLETİŞİM HATTI
        </a>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onExport}
          className="text-[10px] font-mono text-slate-500 hover:text-indigo-400 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50"
        >
          <Code size={12} /> .JSON VERİSİNİ DIŞA AKTAR
        </button>
      </div>
    </div>
  </footer>
);

const Header = ({ activeTab, setActiveTab, totalMembers }) => (
  <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
    <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
          <Gamepad2 className="text-white" size={18} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight leading-none">IGD</h1>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1"><Globe size={10} /> {totalMembers} Üye</p>
        </div>
      </div>
      <nav className="flex items-center gap-2">
        <button onClick={() => setActiveTab('network')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === 'network' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
          <Users size={16} /> <span className="hidden sm:inline">Ağ</span>
        </button>
        <button onClick={() => setActiveTab('join')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === 'join' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}>
          <Plus size={16} /> <span className="hidden sm:inline">Katıl</span>
        </button>
      </nav>
    </div>
  </header>
);

const MemberCard = ({ member, onSelect }) => {
  // Support both Supabase 'roles' and local 'role' properties
  const roles = Array.isArray(member.roles) ? member.roles : (Array.isArray(member.role) ? member.role : [member.role]);
  const mainRoleId = roles[0];
  const sideRoleIds = roles.slice(1);

  const mainRoleInfo = ROLES.find(r => r.id === mainRoleId) || ROLES[1];
  const levelInfo = LEVELS.find(l => l.id === member.level);
  const statusInfo = WORK_STATUSES.find(s => s.id === (member.work_status || member.workStatus)) || WORK_STATUSES[0];
  const availInfo = AVAILABILITY.find(a => a.id === member.availability);

  return (
    <div className="group relative bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 hover:border-indigo-500/30 rounded-xl p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/10 flex flex-col h-full backdrop-blur-sm overflow-hidden">
      <div className="cursor-pointer flex flex-col flex-grow" onClick={() => onSelect(member)}>
        {/* HEADER */}
        <div className="flex justify-between items-start mb-3">
          <div className={`p-2.5 rounded-xl ${mainRoleInfo.bg} ${mainRoleInfo.color} border ${mainRoleInfo.border}`}>
            {mainRoleInfo.icon}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${statusInfo.color}`}>{statusInfo.label}</span>
            <div className="flex gap-2 text-xs text-slate-500">
              {member.location && <span className="flex items-center gap-1"><MapPin size={10} /> {member.location}</span>}
              {availInfo && <span className="flex items-center gap-1"><Clock size={10} /> {availInfo.label}</span>}
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">{member.name}</h3>

          {/* Main Role Label */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span className="font-bold text-indigo-400 uppercase text-[10px] tracking-wide border border-indigo-500/30 px-1.5 py-0.5 rounded bg-indigo-500/10">ANA ROL</span>
            <span className="font-medium text-slate-200">{mainRoleInfo.label}</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>{levelInfo?.label}</span>
          </div>

          {/* Side Roles Tags */}
          {sideRoleIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {sideRoleIds.map(rid => {
                const rInfo = ROLES.find(r => r.id === rid);
                if (!rInfo) return null;
                return (
                  <span key={rid} className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${rInfo.color} ${rInfo.bg} ${rInfo.border} flex items-center gap-1 opacity-80`}>
                    {rInfo.icon && React.cloneElement(rInfo.icon, { size: 10 })} {rInfo.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* BIO */}
        <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">{member.bio}</p>

        {/* INVESTMENT BUDGET (FOR INVESTORS) */}
        {
          (member.investment_budget || member.investmentBudget) && roles.includes('investor') && (
            <div className="mb-4 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign size={10} /> Yatırım Bütçesi</p>
              <p className="text-xs text-green-200 font-medium">{member.investment_budget || member.investmentBudget}</p>
            </div>
          )
        }

        {/* SKILLS & ENGINES */}
        <div className="space-y-2 mb-4">
          {member.skills && (
            <div className="flex flex-wrap gap-1.5">
              <div className="text-[10px] text-slate-500 font-bold w-full uppercase tracking-tighter">Yetenekler</div>
              <span className="text-[10px] text-indigo-300/80 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 italic truncate max-w-full block">{member.skills}</span>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER / SOCIALS */}
      <div className="mt-auto pt-3 border-t border-slate-700/50 flex flex-col gap-3">
        <button
          onClick={() => onSelect(member)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all border border-slate-700 border-dashed"
        >
          Detayları Gör
        </button>
        {/* Contact Button */}
        {(member.whatsapp) && (
          <a
            href={`https://wa.me/${member.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-500 rounded-xl transition-all shadow-lg shadow-green-900/20 active:scale-95"
          >
            <MessageCircle size={16} /> WhatsApp ile Mesaj At
          </a>
        )}
      </div>
    </div>
  );
};

const MemberDetailModal = ({ member, onClose }) => {
  if (!member) return null;

  const roles = Array.isArray(member.roles) ? member.roles : (Array.isArray(member.role) ? member.role : [member.role]);
  const mainRoleId = roles[0];
  const sideRoleIds = roles.slice(1);
  const mainRoleInfo = ROLES.find(r => r.id === mainRoleId) || ROLES[1];
  const levelInfo = LEVELS.find(l => l.id === member.level);
  const statusInfo = WORK_STATUSES.find(s => s.id === (member.work_status || member.workStatus)) || WORK_STATUSES[0];
  const availInfo = AVAILABILITY.find(a => a.id === member.availability);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image/Pattern */}
        <div className="h-32 bg-gradient-to-br from-indigo-900 to-purple-900 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-950/50 text-white rounded-full hover:bg-slate-950 transition-colors z-10"
          >
            <X size={20} />
          </button>
          <div className="absolute -bottom-12 left-8 p-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
            <div className={`p-6 rounded-xl ${mainRoleInfo.bg} ${mainRoleInfo.color} border ${mainRoleInfo.border}`}>
              {React.cloneElement(mainRoleInfo.icon, { size: 48 })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 px-8 pb-8 overflow-y-auto no-scrollbar">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{member.name}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded border uppercase tracking-wider ${statusInfo.color}`}>{statusInfo.label}</span>
                <span className="text-sm text-slate-400 flex items-center gap-1"><MapPin size={14} /> {member.location || 'Bilinmiyor'}</span>
                <span className="text-sm text-slate-400 flex items-center gap-1"><Clock size={14} /> {availInfo?.label || 'Belirtilmedi'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <section>
                <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <User size={16} /> Biyografi
                </h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                  {member.bio || 'Bu üye henüz bir biyografi eklememiş.'}
                </p>
              </section>

              {member.skills && (
                <section>
                  <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Wrench size={16} /> Yetenekler
                  </h4>
                  <p className="text-slate-300 bg-slate-950 border border-slate-800 p-4 rounded-xl text-sm italic">
                    {member.skills}
                  </p>
                </section>
              )}

              {member.engines && member.engines.length > 0 && (
                <section>
                  <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Database size={16} /> Kullanılan Araçlar & Motorlar
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {member.engines.map((engine, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg text-xs font-medium">
                        {engine}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-6">
              <section>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Detaylar</h4>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Deneyim Seviyesi</span>
                    <span className="text-sm text-slate-200 font-medium">{levelInfo?.label || 'Belirtilmedi'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Diller</span>
                    <span className="text-sm text-slate-200 font-medium">{member.languages || 'Belirtilmedi'}</span>
                  </div>
                  {member.investment_budget && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-green-500 uppercase font-bold">Yatırım Bütçesi</span>
                      <span className="text-sm text-green-200 font-bold">{member.investment_budget}</span>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Bağlantılar</h4>
                <div className="flex flex-col gap-2">
                  {member.discord && (
                    <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800">
                      <MessageSquare size={14} className="text-indigo-400" />
                      <span className="text-xs font-mono text-slate-300 truncate">{member.discord}</span>
                    </div>
                  )}
                  {member.socials?.github && (
                    <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors">
                      <Github size={14} className="text-white" />
                      <span className="text-xs text-slate-300">GitHub</span>
                    </a>
                  )}
                  {member.socials?.artstation && (
                    <a href={member.socials.artstation} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors">
                      <Palette size={14} className="text-pink-400" />
                      <span className="text-xs text-slate-300">ArtStation</span>
                    </a>
                  )}
                  {member.socials?.linkedin && (
                    <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors">
                      <Linkedin size={14} className="text-blue-400" />
                      <span className="text-xs text-slate-300">LinkedIn</span>
                    </a>
                  )}
                  {member.portfolio && (
                    <a href={member.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-lg border border-indigo-500/30 transition-colors">
                      <ExternalLink size={14} className="text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-400">Web Portfolyo</span>
                    </a>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Static Footer in Modal */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 mt-auto">
          {member.whatsapp ? (
            <a
              href={`https://wa.me/${member.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 py-4 text-sm font-bold text-white bg-green-600 hover:bg-green-500 rounded-2xl transition-all shadow-xl shadow-green-900/20 active:scale-[0.98]"
            >
              <MessageCircle size={20} /> WhatsApp ile Mesaj At
            </a>
          ) : (
            <div className="w-full py-4 text-center text-slate-500 text-sm italic border border-slate-800 rounded-2xl">
              Bu üye iletişim bilgisi paylaşmamış.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const JoinForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', whatsapp: '', role: ['dev'], level: 'student', workStatus: 'open', availability: 'full',
    location: '', languages: '', discord: '', skills: '', bio: '', portfolio: '',
    socials: { github: '', linkedin: '', twitter: '', artstation: '', instagram: '' },
    engines: [], genres: [], investmentBudget: ''
  });

  const [verificationState, setVerificationState] = useState('idle');
  const [serverOtp, setServerOtp] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetOtpTrigger, setResetOtpTrigger] = useState(0);

  const toggleSelection = (field, item) => {
    setFormData(prev => {
      const list = prev[field] || [];
      return list.includes(item) ? { ...prev, [field]: list.filter(i => i !== item) } : { ...prev, [field]: [...list, item] };
    });
  };

  const toggleRole = (roleId) => {
    setFormData(prev => {
      const currentRoles = prev.role;
      // 1. Deselect if already selected
      if (currentRoles.includes(roleId)) {
        return { ...prev, role: currentRoles.filter(id => id !== roleId) };
      }
      // 2. Limit to 3
      if (currentRoles.length >= 3) return prev;

      // 3. Add to selections (Main role is always index 0)
      return { ...prev, role: [...currentRoles, roleId] };
    });
  };

  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({ ...prev, socials: { ...prev.socials, [platform]: value } }));
  };

  const handleEmailChange = (e) => {
    setFormData({ ...formData, email: e.target.value });
    if (verificationState !== 'idle') { setVerificationState('idle'); setServerOtp(null); setErrorMsg(''); }
  };

  const startVerification = async () => {
    if (!EmailService.isValidEmail(formData.email)) { setErrorMsg("Geçerli bir e-posta adresi giriniz."); return; }

    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();

    setVerificationState('sending'); setErrorMsg('');
    try {
      const result = await EmailService.sendVerificationCode(formData.email, formData.name || "Geliştirici", generatedCode);
      if (result.success) { setServerOtp(result.serverCode); setVerificationState('waiting'); setResetOtpTrigger(prev => prev + 1); }
    } catch (err) { setErrorMsg("Servis hatası."); setVerificationState('idle'); }
  };

  const handleOtpComplete = (enteredCode) => {
    if (enteredCode === serverOtp) { setVerificationState('verified'); setErrorMsg(''); }
    else { setErrorMsg("Hatalı kod."); setResetOtpTrigger(prev => prev + 1); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (verificationState !== 'verified') { alert("Lütfen önce e-postanızı doğrulayın."); return; }
    onSave(formData);
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      <div className="bg-slate-950/50 px-5 py-4 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Plus className="text-indigo-400" size={20} /> Aramıza Katıl</h2>
        </div>
        <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
      </div>

      <div className="p-5 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="form-label text-sm text-slate-300 block mb-1.5">İsim Soyisim</label>
                <input type="text" className="form-input w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500" placeholder="Adınız" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <p className="text-[10px] text-slate-500 mt-1">Sitede görünecek adınız.</p>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2"><Briefcase size={16} /> Profesyonel Durum</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-slate-300 block mb-1.5">Deneyim</label><select className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>{LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select></div>
                <div><label className="text-sm text-slate-300 block mb-1.5">Durum</label><select className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500" value={formData.workStatus} onChange={e => setFormData({ ...formData, workStatus: e.target.value })}>{WORK_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-slate-300 block mb-1.5">Müsaitlik</label><select className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500" value={formData.availability} onChange={e => setFormData({ ...formData, availability: e.target.value })}>{AVAILABILITY.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}</select></div>
                <div><label className="text-sm text-slate-300 block mb-1.5">Diller</label><input type="text" className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500" placeholder="TR, EN, JP..." value={formData.languages} onChange={e => setFormData({ ...formData, languages: e.target.value })} /></div>
              </div>
              <div><label className="text-sm text-slate-300 block mb-1.5">Konum (Şehir/Ülke)</label><div className="relative"><MapPin className="absolute left-3 top-2.5 text-slate-500" size={16} /><input type="text" className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500" placeholder="İstanbul, TR" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} /></div></div>
            </div>
          </div>

          <div className="border-t border-slate-800"></div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2"><Wrench size={16} /> Uzmanlık & Roller</h3>
              <span className="text-xs text-slate-500 font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">Seçilen: {formData.role.length}/3</span>
            </div>
            <label className="text-sm text-slate-300 block mb-2">Roller (İlk seçilen ANA ROL olur, diğerleri YAN ROL)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
              {ROLES.filter(r => r.id !== 'all').map(role => {
                const isSelected = formData.role.includes(role.id);
                const isMain = formData.role[0] === role.id;
                const orderIndex = formData.role.indexOf(role.id) + 1;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => toggleRole(role.id)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-xs text-center transition-all h-20 
                    ${isMain
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-500'
                        : isSelected
                          ? 'bg-slate-800 border-indigo-500/50 text-indigo-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                  >
                    {isSelected && (
                      <div className={`absolute top-1 right-1 w-4 h-4 text-[9px] flex items-center justify-center rounded-full font-bold
                        ${isMain ? 'bg-white text-indigo-600' : 'bg-slate-700 text-slate-300'}`}>
                        {orderIndex}
                      </div>
                    )}
                    {role.icon}
                    <span className="mt-1.5 leading-tight">{role.label}</span>
                  </button>
                );
              })}
            </div>

            {formData.role.includes('investor') && (<div className="mb-6 p-4 bg-green-900/10 border border-green-500/20 rounded-xl animate-in fade-in"><label className="text-sm text-green-400 font-bold block mb-1.5 flex items-center gap-1"><DollarSign size={14} /> Yatırım Bütçesi / Stratejisi</label><input type="text" className="w-full bg-slate-950 border border-green-500/30 text-white rounded-lg px-4 py-2.5 outline-none focus:border-green-500" placeholder="Örn: 50k$ - 500k$, Pre-Seed..." value={formData.investmentBudget} onChange={e => setFormData({ ...formData, investmentBudget: e.target.value })} /></div>)}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="text-sm text-slate-300 block mb-2">Kullandığın Motorlar & Araçlar</label><div className="flex flex-wrap gap-2">{[...POPULAR_ENGINES, ...POPULAR_TOOLS].map(tool => (<button key={tool} type="button" onClick={() => toggleSelection('engines', tool)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.engines.includes(tool) ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500'}`}>{tool}</button>))}</div></div>
              <div><label className="text-sm text-slate-300 block mb-2">İlgilendiğin Oyun Türleri</label><div className="flex flex-wrap gap-2">{GENRES.map(genre => (<button key={genre} type="button" onClick={() => toggleSelection('genres', genre)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.genres.includes(genre) ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500'}`}>{genre}</button>))}</div></div>
            </div>
            <div className="mt-4"><label className="text-sm text-slate-300 block mb-1.5">Diğer Yetenekler (Manuel Giriş)</label><input type="text" className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500" placeholder="Jira, Agile, Scrum, Piano, Japonca..." value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} /></div>
          </div>

          <div className="border-t border-slate-800"></div>

          {/* --- BÖLÜM 3: SOSYAL & HİKAYE --- */}
          <div>
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2"><ShieldCheck size={16} /> E-posta & Sosyal Medya Adresleri</h3>
            <div className={`p-4 rounded-xl border mb-6 transition-all ${verificationState === 'verified' ? 'bg-green-500/5 border-green-500/30' : 'bg-slate-950 border-slate-700'}`}>
              <label className="text-sm text-slate-300 block mb-2 flex justify-between">
                <span>E-posta Doğrulama (Zorunlu)</span>
                {verificationState === 'verified' && <span className="text-green-400 text-xs flex items-center gap-1"><CheckCircle2 size={12} /> Onaylı</span>}
              </label>
              <div className="flex gap-2">
                <input required type="email" className="flex-grow bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none disabled:opacity-50 focus:border-indigo-500" placeholder="email@adresiniz.com" value={formData.email} onChange={handleEmailChange} disabled={verificationState !== 'idle'} />
                {verificationState === 'idle' && <button type="button" onClick={startVerification} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors">Kod Gönder</button>}
                {verificationState === 'sending' && <button disabled className="bg-slate-700 text-white px-4 rounded-lg"><Loader2 className="animate-spin" size={16} /></button>}
              </div>
              {verificationState === 'waiting' && <div className="mt-3 animate-in fade-in"><p className="text-xs text-center text-slate-400 mb-2">Gelen kodu giriniz:</p><OtpInput length={4} onComplete={handleOtpComplete} resetTrigger={resetOtpTrigger} /></div>}
              {errorMsg && <p className="text-xs text-red-400 mt-2 text-center">{errorMsg}</p>}
              {verificationState !== 'verified' && <p className="text-[10px] text-slate-500 mt-2">Kayıt için e-posta doğrulaması zorunludur.</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="relative"><MessageSquare className="absolute left-3 top-2.5 text-slate-500" size={16} /><input type="text" className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500" placeholder="Discord: user#0000" value={formData.discord} onChange={e => setFormData({ ...formData, discord: e.target.value })} /></div>
                <div className="relative"><Github className="absolute left-3 top-2.5 text-slate-500" size={16} /><input type="url" className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500" placeholder="GitHub URL" value={formData.socials.github} onChange={e => handleSocialChange('github', e.target.value)} /></div>
                <div className="relative"><Linkedin className="absolute left-3 top-2.5 text-slate-500" size={16} /><input type="url" className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500" placeholder="LinkedIn URL" value={formData.socials.linkedin} onChange={e => handleSocialChange('linkedin', e.target.value)} /></div>
              </div>
              <div className="space-y-3">
                <div className="relative"><Phone className="absolute left-3 top-2.5 text-slate-500" size={16} /><input type="tel" className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500" placeholder="WhatsApp (Örn: 90530...)" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} /></div>
                <div className="relative"><Twitter className="absolute left-3 top-2.5 text-slate-500" size={16} /><input type="url" className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500" placeholder="X / Twitter URL" value={formData.socials.twitter} onChange={e => handleSocialChange('twitter', e.target.value)} /></div>
                <div className="relative"><Instagram className="absolute left-3 top-2.5 text-slate-500" size={16} /><input type="url" className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500" placeholder="Instagram URL" value={formData.socials.instagram} onChange={e => handleSocialChange('instagram', e.target.value)} /></div>
                <div className="relative"><ExternalLink className="absolute left-3 top-2.5 text-slate-500" size={16} /><input type="url" className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500" placeholder="Portfolyo / Web Site URL" value={formData.portfolio} onChange={e => setFormData({ ...formData, portfolio: e.target.value })} /></div>
                <div className="relative"><Palette className="absolute left-3 top-2.5 text-slate-500" size={16} /><input type="url" className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-indigo-500" placeholder="ArtStation URL" value={formData.socials.artstation} onChange={e => handleSocialChange('artstation', e.target.value)} /></div>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-300 block mb-1.5">Kısa Biyografi</label>
              <textarea rows="3" className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-indigo-500 resize-none" placeholder="Kendinden bahset. Ne arıyorsun? Ne sunuyorsun?" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onCancel} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors">Vazgeç</button>
            <button type="submit" disabled={verificationState !== 'verified'} className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-xl shadow-indigo-900/30 transition-all flex justify-center items-center gap-2">
              {verificationState === 'verified' ? <><Save size={20} /> Kaydı Tamamla</> : <><Lock size={20} /> Önce E-postayı Doğrula</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function GameDevNetworkApp() {
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('network');
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    // 1. Initial Fetch
    const fetchMembers = async () => {
      setLoading(true);

      if (!supabase) {
        console.warn("Supabase not configured. Using localStorage fallback.");
        const storedData = localStorage.getItem('gamedev_network_members');
        if (storedData) {
          setMembers(JSON.parse(storedData));
        } else {
          setMembers(INITIAL_DATA);
          localStorage.setItem('gamedev_network_members', JSON.stringify(INITIAL_DATA));
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('igdwebmemberssite')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMembers(data);
      } else {
        console.error("Fetch error:", error);
        // Fallback to initial data if table is empty or error
        if (!data || data.length === 0) setMembers(INITIAL_DATA);
      }
      setLoading(false);
    };

    fetchMembers();

    if (!supabase) return;

    // 2. Realtime Subscription
    const channel = supabase
      .channel('members_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'igdwebmemberssite' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMembers(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setMembers(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSaveMember = async (newMemberData) => {
    try {
      setLoading(true);

      if (!supabase) {
        // Fallback to localStorage logic
        const filteredMembers = members.filter(m => m.email !== newMemberData.email);
        const newMember = { id: Date.now(), ...newMemberData };
        const updatedMembers = [newMember, ...filteredMembers];
        setMembers(updatedMembers);
        localStorage.setItem('gamedev_network_members', JSON.stringify(updatedMembers));
        setActiveTab('network');
        return;
      }

      // Exact 17-column mapping using snake_case as per Supabase schema
      const memberData = {
        name: newMemberData.name || null,
        email: newMemberData.email || null,
        roles: Array.isArray(newMemberData.role) ? newMemberData.role : [],
        level: newMemberData.level || null,
        bio: newMemberData.bio || null,
        location: newMemberData.location || null,
        work_status: newMemberData.workStatus || null,
        availability: newMemberData.availability || null,
        languages: newMemberData.languages || null,
        discord: newMemberData.discord || null,
        whatsapp: newMemberData.whatsapp || null,
        portfolio: newMemberData.portfolio || null,
        socials: newMemberData.socials || {},
        engines: Array.isArray(newMemberData.engines) ? newMemberData.engines : [],
        genres: Array.isArray(newMemberData.genres) ? newMemberData.genres : [],
        skills: newMemberData.skills || null,
        investment_budget: newMemberData.investmentBudget || null
      };

      const { data, error } = await supabase
        .from('igdwebmemberssite')
        .upsert(memberData, { onConflict: 'email' });

      if (error) {
        console.error('Supabase Full Error:', error);
        alert('Veritabanı Hatası: ' + error.message);
      } else {
        alert('Profiliniz başarıyla oluşturuldu/güncellendi! 🎉');
        setActiveTab('network');
      }
    } catch (err) {
      console.error("Critical handleSaveMember Error:", err);
      alert("İşlem sırasında beklenmedik bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(members, null, 2));
    const downloadAnchorNode = document.createElement('a'); downloadAnchorNode.setAttribute("href", dataStr); downloadAnchorNode.setAttribute("download", "gamedev_network.json"); document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove();
  };

  // FILTER LOGIC
  const filteredMembers = members.filter(member => {
    if (!member) return false;

    // Support both Supabase 'roles' and local 'role' properties
    const rolesSource = member.roles || member.role || [];
    const memberRoles = Array.isArray(rolesSource) ? rolesSource : [rolesSource];

    const matchesRole = filterRole === 'all' || memberRoles.includes(filterRole);
    const searchLower = (searchTerm || '').toLowerCase();

    const nameMatch = (member.name || '').toLowerCase().includes(searchLower);
    const skillsMatch = (member.skills || '').toLowerCase().includes(searchLower);
    const locationMatch = (member.location || '').toLowerCase().includes(searchLower);
    const enginesMatch = Array.isArray(member.engines) && member.engines.some(e => e?.toLowerCase().includes(searchLower));

    return matchesRole && (nameMatch || skillsMatch || locationMatch || enginesMatch);
  });

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-500"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 pb-20">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="fixed inset-0 z-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none z-0"></div>

      <Header activeTab={activeTab} setActiveTab={setActiveTab} totalMembers={members.length} />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'network' ? (
          <>
            <div className="flex flex-col gap-5 mb-6">
              {/* SEARCH & FILTER BAR */}
              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full md:w-auto">
                  <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input type="text" placeholder="İsim, yetenek, şehir veya oyun motoru ara..." className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                  {ROLES.map(role => (
                    <button key={role.id} onClick={() => setFilterRole(role.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${filterRole === role.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                      {role.icon} {role.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="text-center py-24 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6"><Users className="text-slate-500" size={40} /></div>
                <h3 className="text-2xl font-bold text-white mb-2">Kimse Bulunamadı</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">Arama kriterlerine uygun üye yok veya henüz kimse katılmadı.</p>
                <button onClick={() => { setFilterRole('all'); setSearchTerm('') }} className="text-indigo-400 hover:text-indigo-300 underline">Filtreleri Temizle</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredMembers.map(member => (
                  <MemberCard key={member.id} member={member} onSelect={setSelectedMember} />
                ))}
              </div>
            )}
          </>
        ) : (
          <JoinForm onSave={handleSaveMember} onCancel={() => setActiveTab('network')} />
        )}
      </main>

      <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />

      <StickyFooter onExport={handleExportJSON} />
    </div>
  );
}
