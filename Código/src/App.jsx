import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  FileText,
  Mail,
  HardDrive,
  Cpu,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Upload,
  Download,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
  Server,
  Database,
  Layers,
  Zap,
  ChevronRight,
  Info,
  ExternalLink,
  Eye,
  Filter,
  Link2,
  FileCode,
  Radio,
  Sliders,
  Check,
  X,
  Play,
  Copy,
  Crosshair
} from 'lucide-react';

// --- MOCK DATABASE & INITIAL STATES ---

const INITIAL_QUARANTINE_ITEMS = [
  {
    id: 'SEC-8921-2026',
    name: 'invoice_march2026_urgent.pdf.exe',
    type: 'File (Malware)',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    riskScore: 94,
    status: 'Quarantined',
    timestamp: '2026-10-30 18:42:12',
    threatType: 'Trojan.Win32.Stealer / CobaltStrike Beacon',
    size: '2.4 MB',
    detectedBy: '48/62 AV Engines',
    details: 'Matched YARA rule: APT_CobaltStrike_Payload_v4'
  },
  {
    id: 'SEC-8920-2026',
    name: 'URGENT: Verify Your Bank Account Security',
    type: 'Email (Phishing)',
    hash: '7a18f2d1e0129bc88aef661c28001a21',
    riskScore: 88,
    status: 'Isolated',
    timestamp: '2026-10-30 17:15:04',
    threatType: 'Credential Harvesting / Domain Spoofing',
    size: '42 KB',
    detectedBy: 'Phishing AI Engine',
    details: 'Mismatched SPF/DKIM, link redirects to shadow-domain-login.ru'
  },
  {
    id: 'SEC-8918-2026',
    name: 'quarterly_report_q3.xlsx',
    type: 'File (Clean)',
    hash: 'a12bc900f02e11a88b99d1234a56b89c021111002233445566778899aabbccdd',
    riskScore: 2,
    status: 'Cleared',
    timestamp: '2026-10-30 15:02:40',
    threatType: 'None (Safe)',
    size: '1.1 MB',
    detectedBy: '0/62 AV Engines',
    details: 'Clean document, no embedded macros'
  },
  {
    id: 'SEC-8912-2026',
    name: 'HR_Policy_Update.docx',
    type: 'File (Sanitized)',
    hash: 'ff89100223311aabbccddeeff00112233445566778899aabbccddeeff001122',
    riskScore: 45,
    status: 'Sanitized',
    timestamp: '2026-10-29 22:11:05',
    threatType: 'Suspicious VBA Macro Stripped',
    size: '512 KB',
    detectedBy: 'Sanitization Pipeline',
    details: 'VBA AutoOpen macro removed safely, converted to macro-free docx'
  }
];

const AV_VENDORS_LIST = [
  { name: 'CrowdStrike Falcon', status: 'Malicious', detail: 'Win32.Ransomware.LockBit' },
  { name: 'SentinelOne Singularity', status: 'Malicious', detail: 'Trojan.Generic.Heur' },
  { name: 'Microsoft Defender', status: 'Malicious', detail: 'Trojan:Win32/CobaltStrike' },
  { name: 'Kaspersky Security', status: 'Malicious', detail: 'HEUR:Backdoor.Win32.Agent' },
  { name: 'Bitdefender Cyber Threat', status: 'Malicious', detail: 'Gen:Variant.Razy.9102' },
  { name: 'Palo Alto Cortex XDR', status: 'Malicious', detail: 'WildFire.Malware' },
  { name: 'Sophos Intercept X', status: 'Malicious', detail: 'Mal/Generic-S' },
  { name: 'Symantec Endpoint', status: 'Malicious', detail: 'Trojan.Gen.2' },
  { name: 'Trend Micro Apex', status: 'Malicious', detail: 'TROJ_FRN.0211' },
  { name: 'ESET NOD32', status: 'Malicious', detail: 'Win32/TrojanDownloader' },
  { name: 'Fortinet FortiGate', status: 'Malicious', detail: 'W32/Malware.Agent' },
  { name: 'Malwarebytes Premier', status: 'Malicious', detail: 'Malware.AI.412001' },
  { name: 'Avast CyberCapture', status: 'Clean', detail: 'No threat detected' },
  { name: 'AVG Antivirus', status: 'Clean', detail: 'No threat detected' },
  { name: 'McAfee Total Protection', status: 'Malicious', detail: 'Artemis!E3B0C44298FC' },
  { name: 'ClamAV OpenSource', status: 'Clean', detail: 'No threat detected' }
];

const PRESET_PHISHING_SAMPLES = [
  {
    title: '🚨 CEO Wire Transfer Fraud (Phishing)',
    sender: 'ceo-office@company-corp-domain.net',
    recipient: 'finance-lead@neofasa.internal',
    subject: 'URGENT: Confidential Wire Transfer Request #90812',
    body: `Hello Finance Team,

I am in a high-priority acquisition meeting right now and cannot take phone calls. 
I need you to process an immediate wire transfer of $48,500 to our strategic partner's offshore account.

Please click here immediately to authorize the invoice:
http://login-security-portal.financial-update-corp.xyz/auth?id=90812

Failure to complete this today will breach contract terms. Keep this strictly confidential.

Best regards,
Alexander Vance
Chief Executive Officer`,
    headers: `Received: from mail-relay-shadow.xyz (mail-relay-shadow.xyz [185.220.101.45])
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=phish-domain.xyz; s=2026;
Authentication-Results: spf=fail (sender IP 185.220.101.45 is not authorized) dkim=fail dmarc=fail`
  },
  {
    title: '⚠️ Fake IT Password Reset (Credential Harvester)',
    sender: 'it-support-admin@company-security-portal-verify.com',
    recipient: 'user.employee@neofasa.internal',
    subject: 'CRITICAL: Mandatory Password Reset - Security Notice',
    body: `Neofasa Security Alert:

Our automated IDS system detected 3 failed login attempts from Moscow, Russia on your corporate account.
Your account access will be suspended within 2 hours unless you re-verify your MFA credentials.

Update Credentials Now:
https://neofasa-login-verification.auth-portal-secure.info/reset-pass

If you do not perform this action, your workstation access will be locked by SysAdmin.`,
    headers: `Received: from bad-actor-vps.net (bad-actor-vps.net [192.168.99.12])
Authentication-Results: spf=softfail dkim=none dmarc=fail`
  },
  {
    title: '✅ Legitimate Internal IT Security Audit (Safe)',
    sender: 'sec-ops@neofasa.internal',
    recipient: 'all-staff@neofasa.internal',
    subject: 'Monthly Cyber Hygiene Reminder & Policy Review',
    body: `Hi Team,

This is our routine monthly reminder to complete your mandatory Cyber Security Hygiene Module on the internal HR portal.

Portal Link:
https://internal.neofasa.corp/training/module-4

No immediate action is required unless your portal status shows pending.

Best,
Neofasa SecOps Team`,
    headers: `Received: from mail.neofasa.corp (mail.neofasa.corp [10.0.1.15])
Authentication-Results: spf=pass dkim=pass dmarc=pass`
  }
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('malware'); // 'malware', 'phishing', 'vault', 'architecture'

  // Visual Effects Toggles
  const [scanlines, setScanlines] = useState(true);
  const [sysStatus, setSysStatus] = useState({
    gateway: 'ONLINE (0.4ms)',
    natsBus: 'ACTIVE (14k msg/s)',
    virusTotal: 'CONNECTED (API v3)',
    redis: 'SYNCHRONIZED (98.4% Hit)'
  });

  // -------------------------------------------------------------
  // MODULE 1: MALWARE SCANNER STATE
  // -------------------------------------------------------------
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [scanResult, setScanResult] = useState(null);

  // Default Mock File loader options
  const sampleFiles = [
    { name: 'malicious_invoice_v3.exe', size: '2.8 MB', risk: 'high' },
    { name: 'quarterly_financials_2026.docx', size: '850 KB', risk: 'clean' },
    { name: 'system_patch_v4.2.iso', size: '412 MB', risk: 'medium' }
  ];

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (fileObj) => {
    setSelectedFile({
      name: fileObj.name,
      size: (fileObj.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: fileObj.type || 'application/octet-stream'
    });
    setScanResult(null);
  };

  const runMalwareScan = () => {
    if (!selectedFile) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanStage('Initializing isolation buffer & calculating SHA-256 hash...');

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          generateMalwareReport();
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 18) + 8;
        if (next > 25 && next < 50) {
          setScanStage('Querying Redis reputational hash cache...');
        } else if (next >= 50 && next < 75) {
          setScanStage('Dispatching payload via NATS to VirusTotal Multi-AV Cluster...');
        } else if (next >= 75 && next < 95) {
          setScanStage('Running YARA pattern rules & heuristic behavior analysis...');
        }
        return next > 100 ? 100 : next;
      });
    }, 350);
  };

  const generateMalwareReport = () => {
    const isHighRisk = selectedFile.name.includes('exe') || selectedFile.name.includes('iso');
    const score = isHighRisk ? 92 : 3;

    setScanResult({
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      md5: '5d41402abc4b2a76b9719d911017c592',
      sha1: 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d',
      riskScore: score,
      verdict: isHighRisk ? 'MALICIOUS_THREAT_DETECTED' : 'CLEAN_VERIFIED',
      detectionRatio: isHighRisk ? '48 / 62 Engines' : '0 / 62 Engines',
      yaraRules: isHighRisk
        ? ['APT_CobaltStrike_Beacon', 'Ransomware_LockBit_Header', 'Obfuscated_PE_Shellcode']
        : ['Standard_Clean_PE_Format'],
      mimeType: selectedFile.type,
      vendors: AV_VENDORS_LIST.map((v) => ({
        ...v,
        status: isHighRisk ? v.status : 'Clean',
        detail: isHighRisk ? v.detail : 'No threat detected'
      }))
    });
  };

  // -------------------------------------------------------------
  // MODULE 2: PHISHING ANALYZER STATE
  // -------------------------------------------------------------
  const [phishTab, setPhishTab] = useState('text'); // 'text' or 'url'
  const [emailText, setEmailText] = useState('');
  const [emailHeaders, setEmailHeaders] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [isAnalyzingPhish, setIsAnalyzingPhish] = useState(false);
  const [phishReport, setPhishReport] = useState(null);

  const loadSampleEmail = (sampleIndex) => {
    const sample = PRESET_PHISHING_SAMPLES[sampleIndex];
    setEmailText(`From: ${sample.sender}\nTo: ${sample.recipient}\nSubject: ${sample.subject}\n\n${sample.body}`);
    setEmailHeaders(sample.headers);
    setPhishReport(null);
  };

  const runPhishingAnalysis = () => {
    if (!emailText && !targetUrl) return;
    setIsAnalyzingPhish(true);
    setPhishReport(null);

    setTimeout(() => {
      setIsAnalyzingPhish(false);

      if (phishTab === 'url') {
        const isSuspiciousUrl = targetUrl.includes('xyz') || targetUrl.includes('info') || targetUrl.includes('verify') || targetUrl.includes('login');
        setPhishReport({
          type: 'URL Scan',
          target: targetUrl || 'http://suspicious-portal-update.xyz/login',
          riskScore: isSuspiciousUrl ? 89 : 12,
          domainAge: isSuspiciousUrl ? '3 Days Old (High Risk)' : '6 Years Old (Trusted)',
          ipAddress: '185.220.101.99 (Host: CyberShack VPS)',
          sslValid: isSuspiciousUrl ? 'Invalid / Untrusted Authority' : 'Valid (DigiCert TLS v1.3)',
          indicators: isSuspiciousUrl
            ? [
                'Newly Registered Domain (< 7 days)',
                'Spoofed Login Page detected (Clones Office365 layout)',
                'Known IP range flagged in Threat Intel databases',
                'URL contains typosquatting pattern'
              ]
            : ['Domain has clean historical reputation', 'SSL certificate matches host name', 'No dynamic obfuscation scripts detected'],
          aiRecommendation: isSuspiciousUrl
            ? 'BLOCK ACCESS IMMEDIATELY. Add domain to corporate DNS sinkhole and proxy blocklist.'
            : 'URL appears benign. Safe to proceed.'
        });
      } else {
        const isPhish = emailText.toLowerCase().includes('urgent') || emailText.toLowerCase().includes('wire') || emailText.toLowerCase().includes('password') || emailText.toLowerCase().includes('click');
        setPhishReport({
          type: 'Email Body & Header Analysis',
          target: 'Submitted Email Payload',
          riskScore: isPhish ? 91 : 8,
          spfStatus: isPhish ? 'FAIL (Sender IP spoofed)' : 'PASS (Domain match)',
          dkimStatus: isPhish ? 'FAIL (Signature signature verification error)' : 'PASS (Valid signature)',
          dmarcStatus: isPhish ? 'REJECT (Policy enforced)' : 'PASS (Compliance verified)',
          urgencyLanguage: isPhish ? 'HIGH (Urgent request, threat of access suspension, immediate transfer request)' : 'LOW (Informational tones)',
          indicators: isPhish
            ? [
                'Executive / CEO Impersonation attempt detected',
                'Header envelope sender mismatch (Return-Path differs from From address)',
                'Embedded hyperlink points to unverified TLD (.xyz)',
                'Urgency heuristic score triggered (98%)'
              ]
            : ['Header alignment consistent', 'Links point to authorized internal domain (.corp)', 'DKIM cryptographic signature verified'],
          aiRecommendation: isPhish
            ? 'CRITICAL PHISHING ALERT: Isolate email from user inbox, block sender domain, and trigger SOC Incident Response.'
            : 'Email metadata matches expected parameters. Classified as Legitimate.'
        });
      }
    }, 1200);
  };

  // -------------------------------------------------------------
  // MODULE 3: QUARANTINE VAULT STATE
  // -------------------------------------------------------------
  const [vaultItems, setVaultItems] = useState(INITIAL_QUARANTINE_ITEMS);
  const [vaultFilter, setVaultFilter] = useState('ALL');
  const [selectedVaultItem, setSelectedVaultItem] = useState(null);

  const handleQuarantineAction = (id, action) => {
    setVaultItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (action === 'isolate') return { ...item, status: 'Quarantined' };
          if (action === 'sanitize') return { ...item, status: 'Sanitized', threatType: 'Macros/Links Stripped', riskScore: 10 };
          if (action === 'clear') return { ...item, status: 'Cleared', riskScore: 0 };
        }
        return item;
      })
    );
  };

  const handlePurgeItem = (id) => {
    setVaultItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedVaultItem?.id === id) setSelectedVaultItem(null);
  };

  const exportVaultJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(vaultItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Neofasa_Quarantine_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Send newly scanned malware to quarantine vault
  const sendScanResultToQuarantine = () => {
    if (!scanResult) return;
    const newItem = {
      id: `SEC-${Math.floor(1000 + Math.random() * 9000)}-2026`,
      name: scanResult.fileName,
      type: 'File (Malware Scan)',
      hash: scanResult.sha256,
      riskScore: scanResult.riskScore,
      status: scanResult.riskScore > 50 ? 'Quarantined' : 'Cleared',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      threatType: scanResult.verdict,
      size: scanResult.fileSize,
      detectedBy: scanResult.detectionRatio,
      details: `YARA Matched: ${scanResult.yaraRules.join(', ')}`
    };
    setVaultItems([newItem, ...vaultItems]);
    setActiveTab('vault');
  };

  // -------------------------------------------------------------
  // MODULE 4: ARCHITECTURE VISUALIZER STATE
  // -------------------------------------------------------------
  const [activeArchNode, setActiveArchNode] = useState('frontend');

  const ARCH_NODES = {
    frontend: {
      title: 'FRONTEND (React Cyberpunk UI)',
      tech: 'React 18 + Tailwind CSS + Lucide Icons',
      role: 'User portal for uploading suspicious payloads, viewing VirusTotal detection metrics, real-time phishing scoring, and managing the security quarantine vault.',
      specs: [
        'Single-page responsive design with cyberpunk HUD styling',
        'SHA-256 calculation & client-side MIME inspection',
        'Interactive WebSocket feeds for live threat telemetries'
      ]
    },
    gateway: {
      title: 'API GATEWAY (Kong / Traefik)',
      tech: 'Kong Enterprise / Traefik Proxy v3',
      role: 'Secures incoming API requests, enforces rate-limiting, handles client authorization (JWT), validates MIME types, and screens file payloads before backend entry.',
      specs: [
        'Strict payload inspection (Max upload: 100MB)',
        'Rate limiting: 100 requests / minute per API key',
        'TLS 1.3 encryption termination & DDoS mitigation'
      ]
    },
    backend: {
      title: 'BACKEND API (Go / NestJS Engine)',
      tech: 'Go (Golang) / NestJS Microservice',
      role: 'High-throughput core controller. Accepts uploaded files, calculates cryptographic hashes (SHA-256, MD5, SHA-1), places payloads into isolated temporary storage buffers, and emits events.',
      specs: [
        'Cryptographic hashing pipeline in Go assembly execution',
        'Isolated RAM-backed temporary payload buffer',
        'RESTful & gRPC interface for event orchestration'
      ]
    },
    bus: {
      title: 'EVENT BUS (NATS / RabbitMQ)',
      tech: 'NATS JetStream / RabbitMQ Core',
      role: 'Asynchronous event streaming message broker that enqueues scan jobs, distributes tasks to isolated workers, and ensures fault-tolerant payload processing.',
      specs: [
        'Asynchronous task queuing with sub-millisecond latency',
        'Dead-letter queues (DLQ) for corrupt payload quarantine',
        'Distributed pub/sub messaging model'
      ]
    },
    consumer: {
      title: 'EVENT CONSUMERS & SCAN SERVICES',
      tech: 'YARA Service + Threat Intel API + Quarantine Engine',
      role: 'Decoupled consumer services that pull jobs from the event queue to execute YARA rule checks, query VirusTotal API endpoints, run sandboxed behavioral checks, and apply quarantine rules.',
      specs: [
        'YARA Rule Engine with 10,000+ threat definitions',
        'VirusTotal v3 API Multi-AV Aggregator integration',
        'Sanitization service (Macro stripping, link defanging)'
      ]
    },
    data: {
      title: 'DATALAYER (PostgreSQL & Redis Cache)',
      tech: 'PostgreSQL 16 + Redis Enterprise Cache',
      role: 'PostgreSQL retains audit logs, threat metadata, and quarantine configurations. Redis caches known hash reputations to deliver instant 0ms threat identification.',
      specs: [
        'Redis Hash Reputational Cache (99% lookup hit speed)',
        'PostgreSQL with JSONB metadata storage & full-text query',
        'Encrypted at rest (AES-256 GCM) for quarantine safety'
      ]
    }
  };

  return (
    <div className={`min-h-screen bg-[#05070f] text-gray-100 font-sans relative overflow-x-hidden selection:bg-[#00ff66] selection:text-black ${scanlines ? 'scanlines-effect' : ''}`}>
      {/* Cyberpunk CSS Styles injected directly */}
      <style>{`
        .scanlines-effect::before {
          content: " ";
          display: block;
          position: fixed;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
          z-index: 999;
          background-size: 100% 3px, 6px 100%;
          pointer-events: none;
          opacity: 0.6;
        }

        .neon-border-green {
          box-shadow: 0 0 12px rgba(0, 255, 102, 0.35), inset 0 0 12px rgba(0, 255, 102, 0.1);
          border: 1px solid #00ff66;
        }

        .neon-border-cyan {
          box-shadow: 0 0 12px rgba(0, 243, 255, 0.35), inset 0 0 12px rgba(0, 243, 255, 0.1);
          border: 1px solid #00f3ff;
        }

        .neon-border-red {
          box-shadow: 0 0 12px rgba(255, 0, 85, 0.35), inset 0 0 12px rgba(255, 0, 85, 0.1);
          border: 1px solid #ff0055;
        }

        .neon-text-green {
          text-shadow: 0 0 8px rgba(0, 255, 102, 0.7);
          color: #00ff66;
        }

        .neon-text-cyan {
          text-shadow: 0 0 8px rgba(0, 243, 255, 0.7);
          color: #00f3ff;
        }

        .neon-text-red {
          text-shadow: 0 0 8px rgba(255, 0, 85, 0.7);
          color: #ff0055;
        }

        .cyber-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(0, 255, 102, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 102, 0.05) 1px, transparent 1px);
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.3; }
        }

        .animate-radar {
          animation: spin 4s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* BACKGROUND CYBER GRID */}
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0" />

      {/* TOP HEADER / HUD BAR */}
      <header className="relative z-10 border-b border-[#00ff66]/30 bg-[#0c101d]/90 backdrop-blur-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* LOGO & TITLE */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-11 h-11 bg-black border border-[#00ff66] rounded-sm neon-border-green">
              <Shield className="w-6 h-6 text-[#00ff66] animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#00ff66] rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-wider font-mono neon-text-green">
                  NEOFASA <span className="text-[#00f3ff]">WEB</span>
                </h1>
                <span className="bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/40 text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase">
                  SEC-OS v3.8.4
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Cyber Threat Intelligence & Phishing Orchestration Engine
              </p>
            </div>
          </div>

          {/* SYSTEM TELEMETRY BADGES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-black/60 border border-gray-800 px-2.5 py-1.5 rounded flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
              <div>
                <div className="text-[10px] text-gray-500 uppercase">Gateway</div>
                <div className="text-[#00ff66] font-semibold text-[11px] truncate">{sysStatus.gateway}</div>
              </div>
            </div>

            <div className="bg-black/60 border border-gray-800 px-2.5 py-1.5 rounded flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse" />
              <div>
                <div className="text-[10px] text-gray-500 uppercase">Event Bus</div>
                <div className="text-[#00f3ff] font-semibold text-[11px] truncate">{sysStatus.natsBus}</div>
              </div>
            </div>

            <div className="bg-black/60 border border-gray-800 px-2.5 py-1.5 rounded flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
              <div>
                <div className="text-[10px] text-gray-500 uppercase">VirusTotal</div>
                <div className="text-[#00ff66] font-semibold text-[11px] truncate">{sysStatus.virusTotal}</div>
              </div>
            </div>

            <div className="bg-black/60 border border-gray-800 px-2.5 py-1.5 rounded flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse" />
              <div>
                <div className="text-[10px] text-gray-500 uppercase">Redis Cache</div>
                <div className="text-[#00f3ff] font-semibold text-[11px] truncate">{sysStatus.redis}</div>
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setScanlines(!scanlines)}
              className={`px-3 py-1.5 rounded text-xs font-mono border transition-all flex items-center space-x-1.5 ${
                scanlines
                  ? 'bg-[#00ff66]/20 border-[#00ff66] text-[#00ff66]'
                  : 'bg-gray-800/80 border-gray-700 text-gray-400'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>CRT HUD: {scanlines ? 'ON' : 'OFF'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="relative z-10 border-b border-gray-800 bg-[#080b14]/80 backdrop-blur-sm px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 py-2">
          
          <button
            onClick={() => setActiveTab('malware')}
            className={`px-4 py-2 rounded text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'malware'
                ? 'bg-[#00ff66]/15 border border-[#00ff66] text-[#00ff66] neon-border-green'
                : 'bg-black/40 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
            }`}
          >
            <Shield className="w-4 h-4 text-[#00ff66]" />
            <span>01 // FILE MALWARE SCANNER</span>
          </button>

          <button
            onClick={() => setActiveTab('phishing')}
            className={`px-4 py-2 rounded text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'phishing'
                ? 'bg-[#00f3ff]/15 border border-[#00f3ff] text-[#00f3ff] neon-border-cyan'
                : 'bg-black/40 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
            }`}
          >
            <Mail className="w-4 h-4 text-[#00f3ff]" />
            <span>02 // PHISHING EMAIL DETECTOR</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2 rounded text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'vault'
                ? 'bg-[#ff0055]/15 border border-[#ff0055] text-[#ff0055] neon-border-red'
                : 'bg-black/40 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
            }`}
          >
            <Lock className="w-4 h-4 text-[#ff0055]" />
            <span>03 // QUARANTINE VAULT</span>
            <span className="ml-1 px-1.5 py-0.2 bg-[#ff0055]/30 text-[#ff0055] text-[10px] rounded-full font-sans">
              {vaultItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded text-xs font-mono font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'architecture'
                ? 'bg-[#00ff66]/15 border border-[#00ff66] text-[#00ff66] neon-border-green'
                : 'bg-black/40 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#00ff66]" />
            <span>04 // SYSTEM ARCHITECTURE</span>
          </button>

        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 max-w-7xl mx-auto p-4 md:p-6 space-y-6">

        {/* ========================================================================= */}
        {/* TAB 1: FILE MALWARE ANALYSIS (VIRUSTOTAL ENGINE) */}
        {/* ========================================================================= */}
        {activeTab === 'malware' && (
          <div className="space-y-6">
            
            {/* HERO BAR */}
            <div className="bg-[#0c101d] border border-gray-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-[#00ff66]" />
                  <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
                    VirusTotal Multi-AV Hash & File Inspection Engine
                  </h2>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Upload binary, document, or executable payloads. Computes SHA-256 hash, cross-checks Redis reputation cache, and triggers async multi-vendor AV analysis.
                </p>
              </div>

              {/* Sample Files Quick Loader */}
              <div className="flex items-center space-x-2 font-mono text-xs">
                <span className="text-gray-400 text-[11px]">Quick Samples:</span>
                {sampleFiles.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedFile({ name: s.name, size: s.size, type: 'application/octet-stream' });
                      setScanResult(null);
                    }}
                    className="px-2.5 py-1 bg-black/60 border border-gray-700 hover:border-[#00ff66] text-gray-300 hover:text-[#00ff66] rounded transition-all text-[11px]"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* UPLOAD BOX / SCANNER CONTROLLER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* UPLOAD / DROPZONE (2 COLS) */}
              <div className="lg:col-span-2 space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center min-h-[260px] bg-black/40 backdrop-blur-sm relative overflow-hidden ${
                    dragActive
                      ? 'border-[#00ff66] bg-[#00ff66]/10'
                      : selectedFile
                      ? 'border-[#00f3ff] bg-[#00f3ff]/5'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {/* Subtle Radar Animation in Background */}
                  <div className="absolute opacity-10 pointer-events-none">
                    <div className="w-64 h-64 border border-[#00ff66] rounded-full animate-radar flex items-center justify-center">
                      <div className="w-32 h-32 border border-[#00ff66] rounded-full" />
                    </div>
                  </div>

                  <Upload className={`w-12 h-12 mb-3 ${selectedFile ? 'text-[#00f3ff]' : 'text-gray-500'}`} />

                  {selectedFile ? (
                    <div className="space-y-2 z-10">
                      <span className="px-2.5 py-1 bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/40 rounded font-mono text-xs">
                        FILE LOADED INTO ISOLATION BUFFER
                      </span>
                      <h3 className="text-lg font-mono font-bold text-white">{selectedFile.name}</h3>
                      <p className="text-xs font-mono text-gray-400">
                        Size: <span className="text-[#00ff66]">{selectedFile.size}</span> | Type: {selectedFile.type}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 z-10">
                      <p className="text-sm font-mono text-gray-300">
                        Drag & Drop payload here or <label className="text-[#00ff66] underline cursor-pointer hover:text-white">browse system files<input type="file" className="hidden" onChange={handleFileSelect} /></label>
                      </p>
                      <p className="text-xs font-mono text-gray-500">
                        Supports: EXE, DLL, PDF, DOCX, ZIP, ELF, APK, ISO (Max 100MB)
                      </p>
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  {selectedFile && !isScanning && (
                    <div className="mt-6 flex flex-wrap gap-3 z-10">
                      <button
                        onClick={runMalwareScan}
                        className="px-6 py-2.5 bg-[#00ff66] text-black font-mono font-bold text-sm rounded shadow-lg hover:bg-emerald-400 transition-all flex items-center space-x-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>EXECUTE VIRUSTOTAL SCAN</span>
                      </button>

                      <button
                        onClick={() => { setSelectedFile(null); setScanResult(null); }}
                        className="px-4 py-2.5 bg-gray-900 border border-gray-700 text-gray-300 font-mono text-xs rounded hover:bg-gray-800"
                      >
                        CLEAR SELECTION
                      </button>
                    </div>
                  )}
                </div>

                {/* SCANNING PROGRESS ANIMATION BAR */}
                {isScanning && (
                  <div className="bg-[#0c101d] border border-[#00f3ff] p-5 rounded-lg space-y-3 font-mono neon-border-cyan">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#00f3ff] font-bold animate-pulse">
                        ⚡ SCANNING PAYLOAD IN PROGRESS...
                      </span>
                      <span className="text-[#00ff66] font-bold">{scanProgress}%</span>
                    </div>

                    <div className="w-full h-3 bg-black rounded-full overflow-hidden border border-gray-800">
                      <div
                        className="h-full bg-gradient-to-r from-[#00f3ff] to-[#00ff66] transition-all duration-300"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00f3ff]" />
                      <span>{scanStage}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SIDE PANEL: SCANNER STATUS INFO */}
              <div className="bg-[#0c101d] border border-gray-800 rounded-xl p-5 space-y-4 font-mono text-xs">
                <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-2 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#00ff66]" />
                  <span>ANALYSIS PIPELINE SPECS</span>
                </h3>

                <div className="space-y-3 text-gray-400">
                  <div className="flex justify-between border-b border-gray-900 pb-1.5">
                    <span>Hashing Speed:</span>
                    <span className="text-white">SHA-256 @ 1.2 GB/s</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-900 pb-1.5">
                    <span>Redis Cache Hit Rate:</span>
                    <span className="text-[#00ff66]">98.4% Instant Hit</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-900 pb-1.5">
                    <span>Active AV Engines:</span>
                    <span className="text-[#00f3ff]">62 Integrated Vendors</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-900 pb-1.5">
                    <span>YARA Definitions:</span>
                    <span className="text-white">v2026.10 Active Rules</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-900 pb-1.5">
                    <span>Isolation Environment:</span>
                    <span className="text-[#00ff66]">gVisor / Docker Sandbox</span>
                  </div>
                </div>

                <div className="p-3 bg-black/60 border border-gray-800 rounded text-[11px] text-gray-400 leading-relaxed">
                  <span className="text-[#00ff66] font-bold">INFO:</span> Files are hashed on ingress. If the hash exists in Redis, results return in sub-10ms. Unseen hashes are streamed via NATS Event Bus for full multi-engine AV scan.
                </div>
              </div>

            </div>

            {/* REPORT VIEW (ON SCAN COMPLETED) */}
            {scanResult && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* VERDICT SUMMARY BANNER */}
                <div
                  className={`p-5 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 font-mono ${
                    scanResult.riskScore > 50
                      ? 'bg-[#ff0055]/10 border-[#ff0055] neon-border-red'
                      : 'bg-[#00ff66]/10 border-[#00ff66] neon-border-green'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {scanResult.riskScore > 50 ? (
                      <ShieldAlert className="w-12 h-12 text-[#ff0055] animate-bounce" />
                    ) : (
                      <ShieldCheck className="w-12 h-12 text-[#00ff66]" />
                    )}
                    <div>
                      <div className="text-xs uppercase text-gray-400">Scan Verdict Analysis</div>
                      <h3
                        className={`text-2xl font-bold font-mono tracking-wider ${
                          scanResult.riskScore > 50 ? 'neon-text-red' : 'neon-text-green'
                        }`}
                      >
                        {scanResult.verdict}
                      </h3>
                      <p className="text-xs text-gray-300 mt-0.5">
                        Detection Score: <span className="font-bold text-white">{scanResult.detectionRatio}</span> | Risk Level: <span className="font-bold">{scanResult.riskScore}%</span>
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS FOR REPORT */}
                  <div className="flex flex-wrap gap-2">
                    {scanResult.riskScore > 50 && (
                      <button
                        onClick={sendScanResultToQuarantine}
                        className="px-4 py-2 bg-[#ff0055] text-white font-mono font-bold text-xs rounded hover:bg-rose-600 transition-all flex items-center space-x-2"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>SEND TO QUARANTINE VAULT</span>
                      </button>
                    )}

                    <button
                      onClick={() => alert(`JSON Report generated for ${scanResult.fileName}`)}
                      className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-200 font-mono text-xs rounded hover:border-[#00f3ff] transition-all flex items-center space-x-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>EXPORT REPORT (JSON)</span>
                    </button>
                  </div>
                </div>

                {/* FILE METADATA & HASH BREAKDOWN */}
                <div className="bg-[#0c101d] border border-gray-800 rounded-xl p-5 space-y-4 font-mono text-xs">
                  <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-2 flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-[#00f3ff]" />
                    <span>CRYPTOGRAPHIC HASHES & METADATA</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-black/60 p-3 rounded border border-gray-800">
                      <div className="text-gray-500 text-[10px] uppercase">SHA-256 HASH</div>
                      <div className="text-[#00ff66] break-all text-[11px] font-semibold mt-1">{scanResult.sha256}</div>
                    </div>
                    <div className="bg-black/60 p-3 rounded border border-gray-800">
                      <div className="text-gray-500 text-[10px] uppercase">MD5 HASH</div>
                      <div className="text-[#00f3ff] break-all text-[11px] font-semibold mt-1">{scanResult.md5}</div>
                    </div>
                    <div className="bg-black/60 p-3 rounded border border-gray-800">
                      <div className="text-gray-500 text-[10px] uppercase">SHA-1 HASH</div>
                      <div className="text-gray-300 break-all text-[11px] font-semibold mt-1">{scanResult.sha1}</div>
                    </div>
                  </div>

                  {/* YARA MATCHES */}
                  <div>
                    <div className="text-gray-400 text-xs mb-2">Matched YARA Behavior Rules:</div>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.yaraRules.map((rule, idx) => (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded text-xs font-bold border ${
                            scanResult.riskScore > 50
                              ? 'bg-[#ff0055]/20 border-[#ff0055] text-[#ff0055]'
                              : 'bg-[#00ff66]/20 border-[#00ff66] text-[#00ff66]'
                          }`}
                        >
                          ⚡ {rule}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* VIRUSTOTAL ENGINE VENDORS GRID */}
                <div className="bg-[#0c101d] border border-gray-800 rounded-xl p-5 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-[#00ff66]" />
                      <span>VIRUSTOTAL MULTI-AV DETECTION MATRIX ({scanResult.vendors.length} ENGINES)</span>
                    </h3>
                    <span className="text-gray-400 text-xs">Live Engine Responses</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {scanResult.vendors.map((vendor, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded border flex items-center justify-between ${
                          vendor.status === 'Malicious'
                            ? 'bg-[#ff0055]/10 border-[#ff0055]/40 text-rose-300'
                            : 'bg-black/50 border-gray-800 text-gray-300'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-bold text-[11px] text-white truncate">{vendor.name}</div>
                          <div className="text-[10px] text-gray-400 truncate">{vendor.detail}</div>
                        </div>
                        {vendor.status === 'Malicious' ? (
                          <XCircle className="w-4 h-4 text-[#ff0055] flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[#00ff66] flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PHISHING EMAIL & URL DETECTOR */}
        {/* ========================================================================= */}
        {activeTab === 'phishing' && (
          <div className="space-y-6">
            
            {/* HERO BAR */}
            <div className="bg-[#0c101d] border border-gray-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-[#00f3ff]" />
                  <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
                    Phishing Email & Domain Authenticity Analyzer
                  </h2>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Inspect raw email headers, body text, and suspicious URLs. Computes SPF / DKIM / DMARC verification, urgency NLP metrics, and malicious domain indicators.
                </p>
              </div>

              {/* PRE-LOAD SAMPLES BUTTONS */}
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                {PRESET_PHISHING_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadSampleEmail(idx)}
                    className="px-3 py-1.5 bg-black/60 border border-gray-700 hover:border-[#00f3ff] text-gray-300 hover:text-[#00f3ff] rounded transition-all text-[11px]"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>
            </div>

            {/* DUAL MODE SELECTOR: EMAIL vs URL */}
            <div className="flex border-b border-gray-800 font-mono text-xs">
              <button
                onClick={() => { setPhishTab('text'); setPhishReport(null); }}
                className={`px-5 py-2.5 font-bold transition-all border-b-2 flex items-center space-x-2 ${
                  phishTab === 'text'
                    ? 'border-[#00f3ff] text-[#00f3ff] bg-[#00f3ff]/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>RAW EMAIL TEXT & HEADER INSPECTOR</span>
              </button>

              <button
                onClick={() => { setPhishTab('url'); setPhishReport(null); }}
                className={`px-5 py-2.5 font-bold transition-all border-b-2 flex items-center space-x-2 ${
                  phishTab === 'url'
                    ? 'border-[#00f3ff] text-[#00f3ff] bg-[#00f3ff]/10'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>SUSPICIOUS LINK / URL CHECKER</span>
              </button>
            </div>

            {/* INPUT FORM CONTAINER */}
            <div className="bg-[#0c101d] border border-gray-800 rounded-xl p-5 space-y-4 font-mono">
              
              {phishTab === 'text' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* EMAIL BODY INPUT */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-300 flex items-center justify-between">
                      <span>EMAIL RAW CONTENT / BODY:</span>
                      <span className="text-gray-500 text-[10px]">Supports full text & body</span>
                    </label>
                    <textarea
                      rows={10}
                      value={emailText}
                      onChange={(e) => setEmailText(e.target.value)}
                      placeholder="Paste suspicious email text here (or click Quick Samples above)..."
                      className="w-full bg-black/70 border border-gray-800 focus:border-[#00f3ff] p-3 text-xs text-gray-200 rounded font-mono focus:outline-none resize-none"
                    />
                  </div>

                  {/* EMAIL HEADERS INPUT */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-300 flex items-center justify-between">
                      <span>RAW EMAIL HEADERS (SPF / DKIM / DMARC):</span>
                      <span className="text-gray-500 text-[10px]">Optional for deep header scan</span>
                    </label>
                    <textarea
                      rows={10}
                      value={emailHeaders}
                      onChange={(e) => setEmailHeaders(e.target.value)}
                      placeholder="Received: from bad-actor-vps.net ...&#10;Authentication-Results: spf=fail dkim=fail..."
                      className="w-full bg-black/70 border border-gray-800 focus:border-[#00f3ff] p-3 text-xs text-gray-200 rounded font-mono focus:outline-none resize-none"
                    />
                  </div>
                </div>
              ) : (
                /* URL INPUT MODE */
                <div className="space-y-2">
                  <label className="text-xs text-gray-300">ENTER SUSPICIOUS DOMAIN OR URL FOR THREAT INTEL CHECK:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="http://login-security-portal.financial-update-corp.xyz/auth?id=90812"
                      className="flex-1 bg-black/70 border border-gray-800 focus:border-[#00f3ff] p-3 text-xs text-gray-200 rounded font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* ANALYZE BUTTON */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={runPhishingAnalysis}
                  disabled={isAnalyzingPhish}
                  className="px-6 py-2.5 bg-[#00f3ff] text-black font-bold text-xs rounded shadow-lg hover:bg-cyan-300 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  {isAnalyzingPhish ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>ANALYZING THREAT INTEL...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="w-4 h-4" />
                      <span>EXECUTE PHISHING DETECTOR</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* PHISHING ANALYSIS RESULTS REPORT */}
            {phishReport && (
              <div className="space-y-6 animate-fadeIn font-mono">
                
                {/* RISK SCORE HEADER */}
                <div
                  className={`p-5 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
                    phishReport.riskScore > 50
                      ? 'bg-[#ff0055]/10 border-[#ff0055] neon-border-red'
                      : 'bg-[#00ff66]/10 border-[#00ff66] neon-border-green'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {phishReport.riskScore > 50 ? (
                      <AlertTriangle className="w-12 h-12 text-[#ff0055] animate-pulse" />
                    ) : (
                      <ShieldCheck className="w-12 h-12 text-[#00ff66]" />
                    )}
                    <div>
                      <div className="text-xs uppercase text-gray-400">PHISHING RISK EVALUATION</div>
                      <h3
                        className={`text-2xl font-bold tracking-wider ${
                          phishReport.riskScore > 50 ? 'neon-text-red' : 'neon-text-green'
                        }`}
                      >
                        {phishReport.riskScore > 50 ? 'HIGH PHISHING THREAT DETECTED' : 'SAFE / LOW PHISHING RISK'}
                      </h3>
                      <p className="text-xs text-gray-300 mt-0.5">
                        Target Analyzed: <span className="font-bold text-white">{phishReport.target}</span>
                      </p>
                    </div>
                  </div>

                  {/* RISK SCORE METER */}
                  <div className="text-center bg-black/60 p-4 rounded border border-gray-800 min-w-[140px]">
                    <div className="text-[10px] text-gray-400 uppercase">RISK SCORE</div>
                    <div
                      className={`text-3xl font-bold ${
                        phishReport.riskScore > 50 ? 'text-[#ff0055]' : 'text-[#00ff66]'
                      }`}
                    >
                      {phishReport.riskScore}%
                    </div>
                  </div>
                </div>

                {/* DETAILED DIAGNOSTICS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* AUTHENTICATION MATRIX (SPF/DKIM/DMARC) */}
                  <div className="bg-[#0c101d] border border-gray-800 rounded-xl p-5 space-y-4 text-xs">
                    <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-2 flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-[#00f3ff]" />
                      <span>DOMAIN & HEADER PROTOCOL AUDIT</span>
                    </h3>

                    {phishReport.spfStatus ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-black/50 p-2.5 rounded border border-gray-800">
                          <span>SPF Validation:</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              phishReport.spfStatus.includes('FAIL')
                                ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]'
                                : 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]'
                            }`}
                          >
                            {phishReport.spfStatus}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-black/50 p-2.5 rounded border border-gray-800">
                          <span>DKIM Signature:</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              phishReport.dkimStatus.includes('FAIL')
                                ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]'
                                : 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]'
                            }`}
                          >
                            {phishReport.dkimStatus}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-black/50 p-2.5 rounded border border-gray-800">
                          <span>DMARC Enforcement:</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              phishReport.dmarcStatus.includes('REJECT')
                                ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]'
                                : 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]'
                            }`}
                          >
                            {phishReport.dmarcStatus}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-black/50 p-2.5 rounded border border-gray-800">
                          <span>Urgency Heuristics:</span>
                          <span className="text-gray-300 font-bold">{phishReport.urgencyLanguage}</span>
                        </div>
                      </div>
                    ) : (
                      /* URL SPECIFIC METRICS */
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-black/50 p-2.5 rounded border border-gray-800">
                          <span>Domain Registration Age:</span>
                          <span className="text-amber-400 font-bold">{phishReport.domainAge}</span>
                        </div>

                        <div className="flex justify-between items-center bg-black/50 p-2.5 rounded border border-gray-800">
                          <span>Resolved Server IP:</span>
                          <span className="text-gray-300 font-bold">{phishReport.ipAddress}</span>
                        </div>

                        <div className="flex justify-between items-center bg-black/50 p-2.5 rounded border border-gray-800">
                          <span>SSL Certificate Status:</span>
                          <span className="text-rose-400 font-bold">{phishReport.sslValid}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* THREAT INDICATORS & AI RECOMMENDATION */}
                  <div className="bg-[#0c101d] border border-gray-800 rounded-xl p-5 space-y-4 text-xs">
                    <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-2 flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-[#00ff66]" />
                      <span>FLAGGED SUSPICIOUS INDICATORS</span>
                    </h3>

                    <ul className="space-y-2">
                      {phishReport.indicators.map((ind, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-gray-300">
                          <span className="text-[#ff0055] font-bold">➢</span>
                          <span>{ind}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="p-3 bg-black/80 border border-[#00f3ff]/40 rounded text-gray-200 mt-4 space-y-1">
                      <div className="text-[10px] text-[#00f3ff] uppercase font-bold">AI ORCHESTRATOR RECOMMENDATION</div>
                      <p className="text-xs leading-relaxed">{phishReport.aiRecommendation}</p>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: HISTORY & QUARANTINE VAULT */}
        {/* ========================================================================= */}
        {activeTab === 'vault' && (
          <div className="space-y-6">
            
            {/* HERO BAR */}
            <div className="bg-[#0c101d] border border-gray-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-[#ff0055]" />
                  <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
                    Quarantine & Threat Isolation Vault
                  </h2>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Isolated repository of captured malicious files and phishing payloads. Perform active sanitization (CDR - Content Disarm & Reconstruction) or purge permanently.
                </p>
              </div>

              {/* ACTION TOOLBAR */}
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                <button
                  onClick={exportVaultJSON}
                  className="px-3.5 py-2 bg-gray-900 border border-gray-700 hover:border-[#00ff66] text-gray-200 hover:text-[#00ff66] rounded transition-all flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT VAULT DATA (JSON)</span>
                </button>
              </div>
            </div>

            {/* FILTER BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0c101d] p-4 border border-gray-800 rounded-xl font-mono text-xs">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Filter By Status:</span>
                {['ALL', 'Quarantined', 'Sanitized', 'Cleared'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setVaultFilter(st)}
                    className={`px-3 py-1 rounded border transition-all ${
                      vaultFilter === st
                        ? 'bg-[#00ff66]/20 border-[#00ff66] text-[#00ff66]'
                        : 'bg-black/40 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="text-gray-500 text-[11px]">
                Total Vault Items: <span className="text-white font-bold">{vaultItems.length}</span>
              </div>
            </div>

            {/* VAULT DATA TABLE */}
            <div className="bg-[#0c101d] border border-gray-800 rounded-xl overflow-hidden font-mono text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/60 border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                      <th className="p-3">ID / TIMESTAMP</th>
                      <th className="p-3">TARGET NAME & TYPE</th>
                      <th className="p-3">RISK SCORE</th>
                      <th className="p-3">VAULT STATUS</th>
                      <th className="p-3 text-right">ISOLATION ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {vaultItems
                      .filter((item) => vaultFilter === 'ALL' || item.status === vaultFilter)
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-black/40 transition-all">
                          
                          <td className="p-3">
                            <div className="text-[#00f3ff] font-bold">{item.id}</div>
                            <div className="text-[10px] text-gray-500">{item.timestamp}</div>
                          </td>

                          <td className="p-3">
                            <div className="text-white font-bold max-w-xs truncate">{item.name}</div>
                            <div className="text-[10px] text-gray-400">{item.type} | {item.size}</div>
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.riskScore > 50
                                  ? 'bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40'
                                  : 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40'
                              }`}
                            >
                              {item.riskScore}%
                            </span>
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                item.status === 'Quarantined'
                                  ? 'bg-[#ff0055]/30 text-[#ff0055]'
                                  : item.status === 'Sanitized'
                                  ? 'bg-[#00f3ff]/30 text-[#00f3ff]'
                                  : 'bg-[#00ff66]/30 text-[#00ff66]'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {item.status !== 'Sanitized' && item.riskScore > 0 && (
                                <button
                                  onClick={() => handleQuarantineAction(item.id, 'sanitize')}
                                  title="Strip macros & harmful URLs (CDR)"
                                  className="px-2.5 py-1 bg-cyan-950 border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:text-black rounded transition-all text-[10px] font-bold"
                                >
                                  SANITIZE (CDR)
                                </button>
                              )}

                              {item.status !== 'Cleared' && (
                                <button
                                  onClick={() => handleQuarantineAction(item.id, 'clear')}
                                  title="Mark as safe & restore"
                                  className="px-2.5 py-1 bg-emerald-950 border border-[#00ff66] text-[#00ff66] hover:bg-[#00ff66] hover:text-black rounded transition-all text-[10px] font-bold"
                                >
                                  CLEAR
                                </button>
                              )}

                              <button
                                onClick={() => handlePurgeItem(item.id)}
                                title="Permanently Purge Payload"
                                className="p-1 bg-rose-950 border border-rose-800 text-rose-400 hover:bg-rose-600 hover:text-white rounded transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SYSTEM ARCHITECTURE INTERACTIVE DIAGRAM */}
        {/* ========================================================================= */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            
            {/* HERO BAR */}
            <div className="bg-[#0c101d] border border-gray-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-[#00ff66]" />
                  <h2 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
                    Neofasa Distributed Platform Architecture
                  </h2>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Interactive blueprint depicting data pipeline flow from React Web Frontend, API Gateway, Go/NestJS Microservice, NATS Queue, YARA/VT Event Consumers, down to PostgreSQL & Redis layer.
                </p>
              </div>
            </div>

            {/* INTERACTIVE ARCHITECTURE DIAGRAM GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
              
              {/* FLOW DIAGRAM NODES MAP (2 COLS) */}
              <div className="lg:col-span-2 bg-[#080c17] border border-gray-800 rounded-xl p-6 relative overflow-hidden space-y-6">
                
                {/* ARCHITECTURE ROW 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                  
                  {/* FRONTEND NODE */}
                  <div
                    onClick={() => setActiveArchNode('frontend')}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      activeArchNode === 'frontend'
                        ? 'bg-[#00ff66]/15 border-[#00ff66] neon-border-green scale-105'
                        : 'bg-black/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gray-500 uppercase">LAYER 01</span>
                      <Shield className="w-4 h-4 text-[#00ff66]" />
                    </div>
                    <h3 className="font-bold text-sm text-white">FRONTEND</h3>
                    <p className="text-[11px] text-gray-400 mt-1">Interfaz React Web, Uploads, Quarantine Admin</p>
                  </div>

                  {/* ARROW INDICATOR */}
                  <div className="hidden md:flex items-center justify-center text-gray-600 font-bold text-lg">
                    ➔
                  </div>

                  {/* API GATEWAY NODE */}
                  <div
                    onClick={() => setActiveArchNode('gateway')}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      activeArchNode === 'gateway'
                        ? 'bg-[#00f3ff]/15 border-[#00f3ff] neon-border-cyan scale-105'
                        : 'bg-black/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gray-500 uppercase">LAYER 02</span>
                      <Server className="w-4 h-4 text-[#00f3ff]" />
                    </div>
                    <h3 className="font-bold text-sm text-white">API GATEWAY</h3>
                    <p className="text-[11px] text-gray-400 mt-1">Kong / Traefik, Rate Limits, MIME Inspection</p>
                  </div>

                </div>

                {/* ARCHITECTURE ROW 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                  
                  {/* BACKEND NODE */}
                  <div
                    onClick={() => setActiveArchNode('backend')}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      activeArchNode === 'backend'
                        ? 'bg-[#00ff66]/15 border-[#00ff66] neon-border-green scale-105'
                        : 'bg-black/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gray-500 uppercase">LAYER 03</span>
                      <Cpu className="w-4 h-4 text-[#00ff66]" />
                    </div>
                    <h3 className="font-bold text-sm text-white">BACKEND API</h3>
                    <p className="text-[11px] text-gray-400 mt-1">Go / NestJS, SHA-256 Hashing, Temp Storage</p>
                  </div>

                  {/* ARROW INDICATOR */}
                  <div className="hidden md:flex items-center justify-center text-gray-600 font-bold text-lg">
                    ➔
                  </div>

                  {/* EVENT BUS NODE */}
                  <div
                    onClick={() => setActiveArchNode('bus')}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      activeArchNode === 'bus'
                        ? 'bg-[#00f3ff]/15 border-[#00f3ff] neon-border-cyan scale-105'
                        : 'bg-black/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gray-500 uppercase">LAYER 04</span>
                      <Radio className="w-4 h-4 text-[#00f3ff]" />
                    </div>
                    <h3 className="font-bold text-sm text-white">EVENT BUS</h3>
                    <p className="text-[11px] text-gray-400 mt-1">NATS / RabbitMQ Async Task Enqueuing</p>
                  </div>

                </div>

                {/* ARCHITECTURE ROW 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  
                  {/* EVENT CONSUMER NODE */}
                  <div
                    onClick={() => setActiveArchNode('consumer')}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      activeArchNode === 'consumer'
                        ? 'bg-[#ff0055]/15 border-[#ff0055] neon-border-red scale-105'
                        : 'bg-black/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gray-500 uppercase">LAYER 05</span>
                      <Zap className="w-4 h-4 text-[#ff0055]" />
                    </div>
                    <h3 className="font-bold text-sm text-white">EVENT CONSUMERS</h3>
                    <p className="text-[11px] text-gray-400 mt-1">YARA Service, VirusTotal Threat Intel, Quarantine CDR</p>
                  </div>

                  {/* DATA LAYER NODE */}
                  <div
                    onClick={() => setActiveArchNode('data')}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      activeArchNode === 'data'
                        ? 'bg-[#00ff66]/15 border-[#00ff66] neon-border-green scale-105'
                        : 'bg-black/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gray-500 uppercase">LAYER 06</span>
                      <Database className="w-4 h-4 text-[#00ff66]" />
                    </div>
                    <h3 className="font-bold text-sm text-white">DATA STORAGE</h3>
                    <p className="text-[11px] text-gray-400 mt-1">PostgreSQL Metadata & Redis Reputational Cache</p>
                  </div>

                </div>

              </div>

              {/* NODE INSPECTOR SIDE PANEL */}
              <div className="bg-[#0c101d] border border-gray-800 rounded-xl p-5 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-white border-b border-gray-800 pb-2 flex items-center space-x-2">
                  <Info className="w-4 h-4 text-[#00f3ff]" />
                  <span>COMPONENT INSPECTOR</span>
                </h3>

                {activeArchNode && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">MODULE TITLE</div>
                      <h4 className="text-sm font-bold text-[#00ff66] mt-0.5">
                        {ARCH_NODES[activeArchNode].title}
                      </h4>
                    </div>

                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">TECHNOLOGY STACK</div>
                      <div className="text-white font-mono bg-black/60 p-2 rounded border border-gray-800 mt-1">
                        {ARCH_NODES[activeArchNode].tech}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-gray-500 uppercase">SYSTEM ROLE & RESPONSIBILITY</div>
                      <p className="text-gray-300 leading-relaxed mt-1">
                        {ARCH_NODES[activeArchNode].role}
                      </p>
                    </div>

                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">TECHNICAL SPECIFICATIONS</div>
                      <ul className="space-y-1.5">
                        {ARCH_NODES[activeArchNode].specs.map((spec, i) => (
                          <li key={i} className="flex items-start space-x-1.5 text-gray-300">
                            <span className="text-[#00f3ff] font-bold">✔</span>
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-gray-900 bg-black/80 py-4 px-6 mt-12 text-center text-xs font-mono text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>NEOFASA WEB // CYBER THREAT PLATFORM &copy; 2026</div>
          <div className="flex space-x-4 text-[11px]">
            <span className="text-[#00ff66]">VT ENGINE: ACTIVE</span>
            <span className="text-[#00f3ff]">NATS BUS: CONNECTED</span>
            <span className="text-[#ff0055]">QUARANTINE: SECURED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}