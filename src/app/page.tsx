'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Calendar as CalendarIcon, Video, CheckSquare, Plus, MapPin, 
  UserPlus, CheckCircle, Circle, MoreVertical, Building2, ChevronLeft, 
  ChevronRight, FileText, ExternalLink, DollarSign, BarChart2, 
  Kanban as KanbanIcon, List, Check, Palette, Sun, Moon, 
  Clock, Tag, User, AlignLeft, CheckSquare as SubtaskIcon, BarChart3, X,
  Link as LinkIcon, Paperclip, Type, Folder, Image as ImageIcon,
  ShieldCheck, ShieldAlert, Layers, Download, Search, Share2, Grid, Upload, Trash2, Settings,
  Zap, Copy, Calculator, Filter, TrendingUp, ChevronDown, Lock, LogIn
} from 'lucide-react';

interface ColorItem {
  hex: string;
  name: string;
}

interface TypographyItem {
  role: string;
  fontFamily: string;
  weight: string;
}

interface BrandAsset {
  id: number;
  name: string;
  category: string;
  url: string;
  fileName?: string;
}

interface LogoItem {
  id: number;
  name: string;
  imageUrl: string;
}

interface AbonoItem {
  id: number;
  date: string;
  amount: number;
  method: string;
  note: string;
}

interface Client {
  id: string;
  name: string;
  color: string;
  description: string;
  archived: boolean;
  driveUrl?: string;
  brandVoice?: string;
  logos?: LogoItem[];
  colors?: ColorItem[];
  typography?: TypographyItem[];
  brandAssets?: BrandAsset[];
  moodboard?: string[];
  dosAndDonts?: { dos: string[]; donts: string[] };
  monthlyFee?: number;
  paymentDueDate?: string;
  nextPaymentDate?: string;
  lastPaymentDate?: string;
  paymentMethod?: string;
  paymentStatus?: 'Pagado' | 'Pendiente' | 'Facturado' | 'Abonado';
  abonos?: AbonoItem[];
}

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

interface Task {
  id: number;
  clientId: string;
  title: string;
  description: string;
  startDate: string;
  deadline: string;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'Por Hacer' | 'En Proceso' | 'Completado';
  assignee: string;
  tags: string[];
  subtasks: Subtask[];
}

interface Post {
  id: number;
  clientId: string;
  date: string;
  time: string;
  networks: string[];
  format: string;
  status: 'Idea' | 'En producción' | 'Listo para publicar' | 'Publicado';
  topic: string;
  copy: string;
  assetUrl?: string;
  fileName?: string;
}

interface Shoot {
  id: number;
  clientId: string;
  date: string;
  time: string;
  location: string;
  script: string;
  assets: string;
  participants: string;
  status?: 'Agendado' | 'Realizado';
}

export default function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const SECRET_PASSWORD = "4202Plazic*";

  // CLIENTES BASE
  const [clients, setClients] = useState<Client[]>([
    { 
      id: 'mitz', 
      name: 'Mitz Bar Lounge', 
      color: '#f64e26', 
      description: 'Estrategia de contenidos y producción audiovisual.', 
      archived: false,
      driveUrl: 'https://drive.google.com',
      brandVoice: 'Juvenil, festivo, dinámico y muy visual.',
      logos: [
        { id: 1, name: 'Logo Principal Mitz', imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&auto=format&fit=crop' }
      ],
      colors: [
        { hex: '#f64e26', name: 'Naranjo Mitz' },
        { hex: '#121215', name: 'Negro Fondo' },
        { hex: '#ffffff', name: 'Blanco Puro' }
      ],
      typography: [
        { role: 'Títulos Principales', fontFamily: 'Montserrat', weight: '800 Bold' }
      ],
      brandAssets: [
        { id: 1, name: 'Logo Vectorial SVG', category: 'Vector', url: 'https://drive.google.com' }
      ],
      moodboard: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop'
      ],
      dosAndDonts: {
        dos: ['Mantener alto contraste visual'],
        donts: ['Nunca deformar la proporción del logo']
      },
      monthlyFee: 450000,
      paymentDueDate: '05 de cada mes',
      nextPaymentDate: '2026-09-05',
      lastPaymentDate: '2026-08-05',
      paymentMethod: 'Transferencia Bancaria',
      paymentStatus: 'Abonado',
      abonos: [
        { id: 1, date: '2026-08-05', amount: 200000, method: 'Transferencia', note: 'Abono 50% inicio de mes' }
      ]
    },
    {
      id: 'aloha',
      name: 'Aloha Chic',
      color: '#10b981',
      description: 'Marca de vestuario y estilo de vida.',
      archived: false,
      monthlyFee: 350000,
      paymentDueDate: '10 de cada mes',
      paymentStatus: 'Pendiente'
    }
  ]);

  const [selectedClientId, setSelectedClientId] = useState<string>('mitz');
  const [activeTab, setActiveTab] = useState<'contenido' | 'grabacion' | 'tareas' | 'brand'>('contenido');
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list' | 'calendar' | 'gantt'>('kanban');
  const [calendarGridMode, setCalendarGridMode] = useState<'month' | 'week'>('month');
  const [ganttScale, setGanttScale] = useState<'days' | 'weeks'>('days');

  // FILTROS RÁPIDOS
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [showArchived, setShowArchived] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 10)); // Agosto 2026

  // FORMULARIOS KIT DE MARCA
  const [newLogoName, setNewLogoName] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [newColorHex, setNewColorHex] = useState('#10b981');
  const [newColorName, setNewColorName] = useState('');
  const [newTypoRole, setNewTypoRole] = useState('');
  const [newTypoFont, setNewTypoFont] = useState('');
  const [newTypoWeight, setNewTypoWeight] = useState('');
  const [newAssetTitle, setNewAssetTitle] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState('Logo');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newMoodboardUrl, setNewMoodboardUrl] = useState('');

  // EDITAR CLIENTE Y COTIZADOR
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [editClientForm, setEditClientForm] = useState<Client | null>(null);
  const [showCotizadorModal, setShowCotizadorModal] = useState(false);
  const [cotizador, setCotizador] = useState({ reels: 8, fotos: 4, rodajes: 2, moderacion: true, clientName: '' });

  // FORMULARIO ECONÓMICO / ABONOS
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    monthlyFee: 0,
    paymentDueDate: '',
    nextPaymentDate: '',
    lastPaymentDate: '',
    paymentMethod: 'Transferencia Bancaria',
    paymentStatus: 'Pendiente' as Client['paymentStatus'],
    abonoAmount: 0,
    abonoNote: ''
  });

  // MODALES PRINCIPALES
  const [selectedDateForModal, setSelectedDateForModal] = useState<string>('2026-08-10');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showShootModal, setShowShootModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  const [newClient, setNewClient] = useState({ name: '', color: '#f64e26', description: '', monthlyFee: 0, paymentDueDate: '', driveUrl: '', brandVoice: '' });

  // DATOS
  const [posts, setPosts] = useState<Post[]>([
    { 
      id: 1, 
      clientId: 'mitz', 
      date: '2026-08-15', 
      time: '18:00', 
      networks: ['Instagram', 'TikTok', 'Facebook'], 
      format: 'Reel', 
      status: 'Publicado', 
      topic: 'Lanzamiento Trago de Autor', 
      copy: '¡Este fin de semana se prende la barra con nuestro nuevo cóctel!', 
      assetUrl: 'https://instagram.com', 
      fileName: 'Reel_Coctel_v1.mp4' 
    }
  ]);

  const [shoots, setShoots] = useState<Shoot[]>([
    { 
      id: 1, 
      clientId: 'mitz', 
      date: '2026-08-14', 
      time: '16:00', 
      location: 'Local Principal (Terraza)', 
      script: 'Toma 1: Preparación del trago. Toma 2: Reacción del cliente.', 
      assets: 'Aro de luz, Cámara 4K, Micrófono inalámbrico', 
      participants: 'Cristopher (Videógrafo), Camila (Modelo), Barman',
      status: 'Agendado'
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: 1, 
      clientId: 'mitz', 
      title: 'Crear lista de tareas con todo lo que necesito para implementar Embudo', 
      description: 'Extraer datos de alcance e interacción.',
      startDate: '2026-08-01',
      deadline: '2026-08-13', 
      priority: 'Alta', 
      status: 'Por Hacer',
      assignee: 'Cris',
      tags: ['Embudo'],
      subtasks: [{ id: 101, title: 'Exportar estadísticas', completed: true }]
    }
  ]);

  const [newPost, setNewPost] = useState<{
    date: string;
    time: string;
    networks: string[];
    format: string;
    topic: string;
    copy: string;
    assetUrl: string;
    fileName: string;
    status: 'Idea' | 'En producción' | 'Listo para publicar' | 'Publicado';
    clientId: string;
  }>({
    date: '2026-08-10',
    time: '18:00',
    networks: ['Instagram'],
    format: 'Reel',
    topic: '',
    copy: '',
    assetUrl: '',
    fileName: '',
    status: 'Idea',
    clientId: ''
  });

  const [newShoot, setNewShoot] = useState({
    date: '2026-08-10',
    time: '15:00',
    location: '',
    script: '',
    assets: '',
    participants: '',
    clientId: ''
  });

  const [taskForm, setTaskForm] = useState<{
    id?: number;
    title: string;
    description: string;
    startDate: string;
    deadline: string;
    priority: 'Alta' | 'Media' | 'Baja';
    status: 'Por Hacer' | 'En Proceso' | 'Completado';
    assignee: string;
    tagsInput: string;
    clientId: string;
    subtasks: Subtask[];
  }>({
    title: '',
    description: '',
    startDate: '2026-08-10',
    deadline: '2026-08-15',
    priority: 'Media',
    status: 'Por Hacer',
    assignee: 'Cris',
    tagsInput: '',
    clientId: '',
    subtasks: []
  });

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // CARGA DESDE SUPABASE Y AUTENTICACIÓN
  useEffect(() => {
    const auth = sessionStorage.getItem('plazic_auth');
    if (auth === 'true') setIsAuthenticated(true);

    const fetchData = async () => {
      const { data: clientsData } = await supabase.from('clients').select('*');
      if (clientsData && clientsData.length > 0) {
setClients(clientsData.map((c: any) => c.data));
      }
      
      const { data: tasksData } = await supabase.from('tasks').select('*');
      if (tasksData && tasksData.length > 0) {
setTasks(tasksData.map((t: any) => t.data));
      }
    };
    fetchData();
  }, []);

  const saveToSupabase = async (table: string, id: number | string, data: any) => {
    await supabase.from(table).upsert({ id: id, data: data });
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputPassword === SECRET_PASSWORD) {
      sessionStorage.setItem('plazic_auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert("Contraseña incorrecta, compadre.");
    }
  };

  // FILTRADOS
  const filteredClients = clients.filter(c => showArchived ? true : !c.archived);
  const activeClientObj = clients.find(c => c.id === selectedClientId);

  const filterItemsByClient = <T extends { clientId: string }>(items: T[]) => {
    if (selectedClientId === 'all') {
      const activeIds = clients.filter(c => !c.archived).map(c => c.id);
      return items.filter(item => activeIds.includes(item.clientId));
    }
    return items.filter(item => item.clientId === selectedClientId);
  };

  const rawPosts = filterItemsByClient(posts);
  const rawShoots = filterItemsByClient(shoots);
  const rawTasks = filterItemsByClient(tasks);

  const filteredPosts = rawPosts.filter(p => {
    if (networkFilter !== 'all' && !p.networks?.includes(networkFilter)) return false;
    return true;
  });

  const filteredTasks = rawTasks.filter(t => {
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const filteredShoots = rawShoots;

  const publishedCount = rawPosts.filter(p => p.status === 'Publicado').length;
  const totalPostsCount = rawPosts.length;
  const pautaProgress = totalPostsCount > 0 ? Math.round((publishedCount / totalPostsCount) * 100) : 0;

  const togglePostPublished = (id: number) => {
    const updated = posts.map(p => {
      if (p.id === id) {
        const newStatus: Post['status'] = p.status === 'Publicado' ? 'Idea' : 'Publicado';
        return { ...p, status: newStatus };
      }
      return p;
    });
    setPosts(updated);
  };

  const toggleShootDone = (id: number) => {
    const updated = shoots.map(s => {
      if (s.id === id) {
        const newStatus = s.status === 'Realizado' ? 'Agendado' : 'Realizado';
        return { ...s, status: newStatus as any };
      }
      return s;
    });
    setShoots(updated);
  };

  const updateTaskStatus = async (id: number, status: Task['status']) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status } : t);
    setTasks(updated);
    const target = updated.find(t => t.id === id);
    if (target) await saveToSupabase('tasks', target.id, target);
  };

  const addSubtaskToForm = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = { id: Date.now(), title: newSubtaskTitle.trim(), completed: false };
    setTaskForm(prev => ({ ...prev, subtasks: [...prev.subtasks, newSub] }));
    setNewSubtaskTitle('');
  };

  const removeSubtaskFromForm = (subId: number) => {
    setTaskForm(prev => ({ ...prev, subtasks: prev.subtasks.filter(s => s.id !== subId) }));
  };

  const toggleNetworkInPost = (net: string) => {
    if (newPost.networks.includes(net)) {
      if (newPost.networks.length > 1) {
        setNewPost({ ...newPost, networks: newPost.networks.filter(n => n !== net) });
      }
    } else {
      setNewPost({ ...newPost, networks: [...newPost.networks, net] });
    }
  };

  const handleSavePost = () => {
    const item: Post = { ...newPost, id: Date.now(), clientId: newPost.clientId || selectedClientId };
    const updated = [...posts, item];
    setPosts(updated);
    setShowPostModal(false);
  };

  const handleSaveShoot = () => {
    const item: Shoot = { ...newShoot, id: Date.now(), clientId: newShoot.clientId || selectedClientId };
    const updated = [...shoots, item];
    setShoots(updated);
    setShowShootModal(false);
  };

  const handleSaveTaskForm = async () => {
    if (!taskForm.title.trim()) return;
    const parsedTags = taskForm.tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);

    let updatedTasks = [...tasks];
    let savedTask: Task;

    if (selectedTaskForEdit) {
      updatedTasks = tasks.map(t => t.id === selectedTaskForEdit.id ? {
        ...t,
        title: taskForm.title,
        description: taskForm.description,
        startDate: taskForm.startDate,
        deadline: taskForm.deadline,
        priority: taskForm.priority,
        status: taskForm.status,
        assignee: taskForm.assignee,
        tags: parsedTags,
        subtasks: taskForm.subtasks,
        clientId: taskForm.clientId
      } : t);
      savedTask = updatedTasks.find(t => t.id === selectedTaskForEdit.id)!;
    } else {
      savedTask = {
        id: Date.now(),
        clientId: taskForm.clientId || (selectedClientId === 'all' ? clients[0]?.id : selectedClientId),
        title: taskForm.title,
        description: taskForm.description,
        startDate: taskForm.startDate,
        deadline: taskForm.deadline,
        priority: taskForm.priority,
        status: taskForm.status,
        assignee: taskForm.assignee,
        tags: parsedTags,
        subtasks: taskForm.subtasks
      };
      updatedTasks = [...tasks, savedTask];
    }

    setTasks(updatedTasks);
    await saveToSupabase('tasks', savedTask.id, savedTask);
    setShowTaskModal(false);
  };

  const globalTotalFee = clients.reduce((acc, curr) => acc + (curr.monthlyFee || 0), 0);
  const globalTotalAbonado = clients.reduce((acc, curr) => acc + (curr.abonos?.reduce((a, b) => a + b.amount, 0) || 0), 0);
  const globalPendingTasks = tasks.filter(t => t.status !== 'Completado').length;

  const totalAbonado = activeClientObj?.abonos?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const saldoPendiente = (activeClientObj?.monthlyFee || 0) - totalAbonado;

  const calculatedFee = (cotizador.reels * 25000) + (cotizador.fotos * 12000) + (cotizador.rodajes * 80000) + (cotizador.moderacion ? 50000 : 0);

  const handleCreateClientFromCotizador = async () => {
    if (!cotizador.clientName.trim()) return;
    const newC: Client = {
      id: Date.now().toString(),
      name: cotizador.clientName.trim(),
      color: '#f64e26',
      description: `Plan: ${cotizador.reels} Reels, ${cotizador.fotos} Fotos, ${cotizador.rodajes} Rodajes`,
      archived: false,
      monthlyFee: calculatedFee,
      paymentDueDate: '05 de cada mes',
      paymentStatus: 'Pendiente'
    };
    const updated = [...clients, newC];
    setClients(updated);
    await saveToSupabase('clients', newC.id, newC);
    setSelectedClientId(newC.id);
    setShowCotizadorModal(false);
    setCotizador({ reels: 8, fotos: 4, rodajes: 2, moderacion: true, clientName: '' });
  };

  const applyTaskTemplate = (templateType: string) => {
    if (templateType === 'reel') {
      setTaskForm(prev => ({
        ...prev,
        title: 'Producción de Reel Audiovisual',
        description: 'Flujo completo de producción de contenido en video corto.',
        tagsInput: 'Reel, Video',
        subtasks: [
          { id: Date.now() + 1, title: 'Redactar guion y escaleta', completed: false },
          { id: Date.now() + 2, title: 'Jornada de rodaje en locación', completed: false },
          { id: Date.now() + 3, title: 'Edición de video y corte de audio', completed: false },
          { id: Date.now() + 4, title: 'Diseñar portada y redactar copy', completed: false }
        ]
      }));
    } else if (templateType === 'parrilla') {
      setTaskForm(prev => ({
        ...prev,
        title: 'Parrilla Mensual de Contenidos',
        description: 'Estructuración y diseño de publicaciones del mes.',
        tagsInput: 'Contenido, Diseño',
        subtasks: [
          { id: Date.now() + 1, title: 'Seleccionar temas estratégicos', completed: false },
          { id: Date.now() + 2, title: 'Diseñar carruseles e imágenes estáticas', completed: false }
        ]
      }));
    }
  };

  const handleDuplicatePost = (p: Post) => {
    const dup: Post = { ...p, id: Date.now(), topic: `${p.topic} (Copia)` };
    setPosts([...posts, dup]);
  };

  const handleDuplicateTask = async (t: Task) => {
    const dup: Task = { ...t, id: Date.now(), title: `${t.title} (Copia)` };
    setTasks([...tasks, dup]);
    await saveToSupabase('tasks', dup.id, dup);
  };

  const openAddModalForDate = (dateStr: string) => {
    const targetDate = dateStr || '2026-08-10';
    setSelectedDateForModal(targetDate);
    const targetClient = selectedClientId === 'all' ? (clients[0]?.id || '') : selectedClientId;

    if (activeTab === 'contenido') {
      setNewPost({ ...newPost, date: targetDate, clientId: targetClient });
      setShowPostModal(true);
    } else if (activeTab === 'grabacion') {
      setNewShoot({ ...newShoot, date: targetDate, clientId: targetClient });
      setShowShootModal(true);
    } else if (activeTab === 'tareas') {
      openTaskModal(undefined, 'Por Hacer', targetDate);
    }
  };

  const openEditClientModal = () => {
    if (!activeClientObj) return;
    setEditClientForm(activeClientObj);
    setShowEditClientModal(true);
  };

  const handleSaveEditedClient = async () => {
    if (!editClientForm) return;
    const updatedClients = clients.map(c => c.id === editClientForm.id ? editClientForm : c);
    setClients(updatedClients);
    await saveToSupabase('clients', editClientForm.id, editClientForm);
    setShowEditClientModal(false);
  };

  const handleCreateClientFull = async () => {
    if (!newClient.name.trim()) return;
    const clientObj: Client = {
      id: Date.now().toString(),
      name: newClient.name.trim(),
      color: newClient.color || '#f64e26',
      description: newClient.description || '',
      archived: false,
      monthlyFee: Number(newClient.monthlyFee) || 0,
      paymentDueDate: newClient.paymentDueDate || '05 de cada mes',
      paymentStatus: 'Pendiente',
      driveUrl: newClient.driveUrl || '',
      brandVoice: newClient.brandVoice || '',
      colors: [{ hex: newClient.color || '#f64e26', name: 'Color Principal' }]
    };
    const updated = [...clients, clientObj];
    setClients(updated);
    await saveToSupabase('clients', clientObj.id, clientObj);
    setSelectedClientId(clientObj.id);
    setNewClient({ name: '', color: '#f64e26', description: '', monthlyFee: 0, paymentDueDate: '', driveUrl: '', brandVoice: '' });
    setShowClientModal(false);
  };

  const handleDeleteClient = async (id: string) => {
    const updatedClients = clients.filter(c => c.id !== id);
    setClients(updatedClients);
    await supabase.from('clients').delete().eq('id', id);
    setSelectedClientId(updatedClients[0]?.id || 'all');
    setShowEditClientModal(false);
  };

  const handleToggleArchiveClient = async (id: string) => {
    const updatedClients = clients.map(c => c.id === id ? { ...c, archived: !c.archived } : c);
    setClients(updatedClients);
    const target = updatedClients.find(c => c.id === id);
    if (target) await saveToSupabase('clients', target.id, target);
    setShowEditClientModal(false);
  };

  const openPaymentModal = () => {
    if (!activeClientObj) return;
    setPaymentForm({
      monthlyFee: activeClientObj.monthlyFee || 0,
      paymentDueDate: activeClientObj.paymentDueDate || '05 de cada mes',
      nextPaymentDate: activeClientObj.nextPaymentDate || '2026-09-05',
      lastPaymentDate: activeClientObj.lastPaymentDate || '2026-08-05',
      paymentMethod: activeClientObj.paymentMethod || 'Transferencia Bancaria',
      paymentStatus: activeClientObj.paymentStatus || 'Pendiente',
      abonoAmount: 0,
      abonoNote: ''
    });
    setShowPaymentModal(true);
  };

  const handleSavePaymentInfo = async () => {
    if (!activeClientObj) return;

    let updatedAbonos = activeClientObj.abonos || [];
    if (paymentForm.abonoAmount > 0) {
      updatedAbonos = [
        ...updatedAbonos,
        {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          amount: Number(paymentForm.abonoAmount),
          method: paymentForm.paymentMethod,
          note: paymentForm.abonoNote || 'Abono registrado'
        }
      ];
    }

    const updatedClient = {
      ...activeClientObj,
      monthlyFee: Number(paymentForm.monthlyFee),
      paymentDueDate: paymentForm.paymentDueDate,
      nextPaymentDate: paymentForm.nextPaymentDate,
      lastPaymentDate: paymentForm.lastPaymentDate,
      paymentMethod: paymentForm.paymentMethod,
      paymentStatus: paymentForm.paymentStatus,
      abonos: updatedAbonos
    };

    const updatedClients = clients.map(c => c.id === activeClientObj.id ? updatedClient : c);
    setClients(updatedClients);
    await saveToSupabase('clients', updatedClient.id, updatedClient);
    setShowPaymentModal(false);
  };

  const openTaskModal = (taskToEdit?: Task, defaultStatus: 'Por Hacer' | 'En Proceso' | 'Completado' = 'Por Hacer', defaultDate?: string) => {
    const targetClient = selectedClientId === 'all' ? (clients[0]?.id || '') : selectedClientId;

    if (taskToEdit) {
      setSelectedTaskForEdit(taskToEdit);
      setTaskForm({
        id: taskToEdit.id,
        title: taskToEdit.title,
        description: taskToEdit.description || '',
        startDate: taskToEdit.startDate || '2026-08-10',
        deadline: taskToEdit.deadline,
        priority: taskToEdit.priority,
        status: taskToEdit.status,
        assignee: taskToEdit.assignee || 'Cris',
        tagsInput: taskToEdit.tags?.join(', ') || '',
        clientId: taskToEdit.clientId,
        subtasks: taskToEdit.subtasks || []
      });
    } else {
      setSelectedTaskForEdit(null);
      setTaskForm({
        title: '',
        description: '',
        startDate: defaultDate || '2026-08-10',
        deadline: defaultDate || '2026-08-15',
        priority: 'Media',
        status: defaultStatus,
        assignee: 'Cris',
        tagsInput: '',
        clientId: targetClient,
        subtasks: []
      });
    }
    setShowTaskModal(true);
  };

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLogoUrl(reader.result as string);
        if (!newLogoName) setNewLogoName(file.name.split('.')[0]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAssetFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAssetUrl(reader.result as string);
        if (!newAssetTitle) setNewAssetTitle(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLogoToBrand = async () => {
    if (!activeClientObj || (!newLogoName.trim() && !newLogoUrl)) return;
    const newLogo: LogoItem = {
      id: Date.now(),
      name: newLogoName.trim() || 'Logo de Marca',
      imageUrl: newLogoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop'
    };
    const updatedLogos = [...(activeClientObj.logos || []), newLogo];
    const updatedClient = { ...activeClientObj, logos: updatedLogos };
    const updatedClients = clients.map(c => c.id === activeClientObj.id ? updatedClient : c);
    setClients(updatedClients);
    await saveToSupabase('clients', updatedClient.id, updatedClient);
    setNewLogoName('');
    setNewLogoUrl('');
  };

  const handleDeleteLogo = async (logoId: number) => {
    if (!activeClientObj) return;
    const updatedLogos = activeClientObj.logos?.filter(l => l.id !== logoId);
    const updatedClient = { ...activeClientObj, logos: updatedLogos };
    const updatedClients = clients.map(c => c.id === activeClientObj.id ? updatedClient : c);
    setClients(updatedClients);
    await saveToSupabase('clients', updatedClient.id, updatedClient);
  };

  const handleAddAssetToBrand = async () => {
    if (!activeClientObj || (!newAssetTitle.trim() && !newAssetUrl)) return;
    const newAsset: BrandAsset = {
      id: Date.now(),
      name: newAssetTitle.trim() || 'Archivo de Marca',
      category: newAssetCategory,
      url: newAssetUrl.trim() || 'https://drive.google.com'
    };
    const updatedAssets = [...(activeClientObj.brandAssets || []), newAsset];
    const updatedClient = { ...activeClientObj, brandAssets: updatedAssets };
    const updatedClients = clients.map(c => c.id === activeClientObj.id ? updatedClient : c);
    setClients(updatedClients);
    await saveToSupabase('clients', updatedClient.id, updatedClient);
    setNewAssetTitle('');
    setNewAssetUrl('');
  };

  const handleDeleteAsset = async (assetId: number) => {
    if (!activeClientObj) return;
    const updatedAssets = activeClientObj.brandAssets?.filter(a => a.id !== assetId);
    const updatedClient = { ...activeClientObj, brandAssets: updatedAssets };
    const updatedClients = clients.map(c => c.id === activeClientObj.id ? updatedClient : c);
    setClients(updatedClients);
    await saveToSupabase('clients', updatedClient.id, updatedClient);
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    if (draggedTaskId !== null) {
      updateTaskStatus(draggedTaskId, targetStatus);
      setDraggedTaskId(null);
    }
  };

  const getDayInitial = (year: number, month: number, dayNum: number) => {
    const dayOfWeek = new Date(year, month, dayNum).getDay();
    const initials = ['D', 'L', 'M', 'Mi', 'J', 'V', 'S'];
    return initials[dayOfWeek];
  };

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay();
    
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDate - i, isCurrentMonth: false, fullDate: '' });
    }

    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDate; i++) {
      const monthStr = (month + 1).toString().padStart(2, '0');
      const dayStr = i.toString().padStart(2, '0');
      const fullDate = `${year}-${monthStr}-${dayStr}`;
      days.push({ day: i, isCurrentMonth: true, fullDate });
    }

    return days;
  };

  const getDaysInWeek = (baseDate: Date) => {
    const current = new Date(baseDate);
    const dayOfWeek = current.getDay();
    const sunday = new Date(current);
    sunday.setDate(current.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const year = d.getFullYear();
      const monthStr = (d.getMonth() + 1).toString().padStart(2, '0');
      const dayStr = d.getDate().toString().padStart(2, '0');
      days.push({
        day: d.getDate(),
        isCurrentMonth: true,
        fullDate: `${year}-${monthStr}-${dayStr}`
      });
    }
    return days;
  };

  const calendarDays = calendarGridMode === 'month' 
    ? getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
    : getDaysInWeek(currentDate);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const bgSidebar = isDarkMode ? 'bg-[#121215] border-zinc-800/40' : 'bg-[#2b2d31] border-zinc-800/40 text-zinc-300';
  const bgMainContent = isDarkMode ? 'bg-[#09090b] text-zinc-200' : 'bg-[#ffffff] text-slate-800';
  const bgHeader = isDarkMode ? 'bg-[#09090b] border-zinc-800/40' : 'bg-white border-slate-200/60';
  const bgKanbanCol = isDarkMode ? 'bg-[#121215] border-zinc-800/40' : 'bg-[#f1f2f4] border-slate-200/50';
  const bgTaskCard = isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200/60 shadow-sm hover:shadow-md';
  const textTitle = isDarkMode ? 'text-white' : 'text-slate-900';
  const gridBorderColor = isDarkMode ? 'border-zinc-800/30' : 'border-slate-200/50';

  const availableNetworks = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'LinkedIn'];

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#09090b] text-white p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-[#1e1f21] p-8 rounded-2xl border border-zinc-800 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-[#f64e26] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
            <Lock className="text-white" size={30} />
          </div>
          <h1 className="text-xl font-black tracking-tight">Plazic Business Manager</h1>
          <p className="text-xs text-zinc-400">Ingresa tu contraseña para acceder al sistema.</p>
          <input 
            type="password" 
            placeholder="Contraseña de acceso" 
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            className="w-full bg-[#2b2d31] border border-zinc-700 rounded-lg p-3 text-sm focus:outline-none focus:border-[#f64e26] text-white text-center font-bold tracking-widest"
            autoFocus
          />
          <button 
            type="submit"
            className="w-full bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold py-3 rounded-lg text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogIn size={16} /> Entrar al Sistema
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen font-sans antialiased overflow-hidden selection:bg-[#f64e26] selection:text-white ${bgMainContent}`}>
      
      <style jsx global>{`
        @media print {
          header, aside, nav, button, .no-print, .modal, #screen-app {
            display: none !important;
          }
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-report {
            display: block !important;
            width: 100% !important;
            padding: 40px !important;
            background: #ffffff !important;
            color: #1e293b !important;
          }
          .print-card {
            border: 1px solid #e2e8f0 !important;
            background: #f8fafc !important;
            border-radius: 12px !important;
            padding: 16px !important;
            margin-bottom: 20px !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #cbd5e1 !important;
            padding: 8px 12px !important;
            text-align: left !important;
            font-size: 11px !important;
          }
          th {
            background-color: #f1f5f9 !important;
            font-weight: bold !important;
          }
        }
        @media screen {
          .print-report {
            display: none !important;
          }
        }
      `}</style>

      {/* INFORME PDF */}
      <div className="print-report">
        <div className="flex items-center justify-between border-b-2 border-[#f64e26] pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">INFORME DE GESTIÓN Y PLANIFICACIÓN</h1>
            <p className="text-sm font-bold text-slate-600 mt-1">Cliente / Marca: <span className="text-[#f64e26]">{activeClientObj?.name || 'Agencia'}</span></p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 block uppercase">PLAZIC BUSINESS MANAGER</span>
            <span className="text-xs text-slate-600">Generado el: {new Date().toLocaleDateString('es-CL')}</span>
          </div>
        </div>

        <div className="print-card">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3 border-b pb-1 text-[#f64e26]">
            1. Planificación de Contenido
          </h2>
          {filteredPosts.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No hay publicaciones agendadas.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Fecha / Hora</th><th>Redes Sociales</th><th>Formato</th><th>Tema / Asunto</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {filteredPosts.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.date}</strong> ({p.time})</td>
                    <td>{p.networks?.join(', ')}</td>
                    <td>{p.format}</td>
                    <td>{p.topic || 'General'}</td>
                    <td><strong className="text-slate-800">{p.status}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="print-card">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3 border-b pb-1 text-[#f64e26]">
            2. Jornadas de Rodaje
          </h2>
          {filteredShoots.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No hay rodajes agendados.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Citación</th><th>Locación / Dirección</th><th>Guion / Escaleta</th><th>Participantes</th></tr>
              </thead>
              <tbody>
                {filteredShoots.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.date}</strong> ({s.time})</td>
                    <td>{s.location}</td>
                    <td>{s.script || 'Sin guion'}</td>
                    <td>{s.participants || 'Equipo'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="print-card">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3 border-b pb-1 text-[#f64e26]">
            3. Resumen Financiero y Estado de Pagos
          </h2>
          {activeClientObj ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-lg border">
                <div>
                  <p><strong>Valor Mensualidad:</strong> ${activeClientObj.monthlyFee?.toLocaleString('es-CL')}</p>
                  <p><strong>Total Abonado:</strong> ${totalAbonado.toLocaleString('es-CL')}</p>
                  <p><strong>Saldo Pendiente:</strong> ${saldoPendiente > 0 ? saldoPendiente.toLocaleString('es-CL') : 0}</p>
                </div>
                <div>
                  <p><strong>Próxima Fecha de Cobro:</strong> {activeClientObj.nextPaymentDate || activeClientObj.paymentDueDate}</p>
                  <p><strong>Método de Pago:</strong> {activeClientObj.paymentMethod || 'Transferencia'}</p>
                  <p><strong>Estado Actual:</strong> <span className="font-bold text-emerald-700">{activeClientObj.paymentStatus}</span></p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Vista Consolidada Agencia</p>
          )}
        </div>
      </div>

      {/* HEADER */}
      <header className="h-12 bg-[#1e1f21] border-b border-zinc-800/80 px-4 flex items-center justify-between z-30 text-white shrink-0 no-print">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#f64e26] flex items-center justify-center font-black text-white text-xs shadow-md">
            P
          </div>
          <span className="font-extrabold text-sm tracking-tight">Plazic Business Manager</span>
        </div>

        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Buscar proyectos, contenidos, tareas..." 
              className="w-full bg-[#2b2d31] text-xs text-white pl-9 pr-4 py-1.5 rounded-full border border-zinc-700/50 focus:outline-none focus:border-[#f64e26] placeholder-zinc-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-12 h-6 rounded-full p-0.5 flex items-center transition-all cursor-pointer ${
              isDarkMode ? 'bg-zinc-800 justify-end' : 'bg-[#f64e26] justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow">
              {isDarkMode ? <Moon size={11} className="text-zinc-900" /> : <Sun size={11} className="text-[#f64e26]" />}
            </div>
          </button>

          <button onClick={() => window.print()} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300">
            <FileText size={15} />
          </button>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div id="screen-app" className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className={`w-56 border-r flex flex-col p-3 shrink-0 no-print ${bgSidebar}`}>
          <button
            onClick={() => setSelectedClientId('all')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2.5 mb-3 border ${
              selectedClientId === 'all'
                ? 'bg-[#f64e26]/20 text-[#f64e26] border-[#f64e26]/40'
                : 'text-zinc-300 border-zinc-700/40 hover:bg-zinc-800/50'
            }`}
          >
            <Building2 size={16} className={selectedClientId === 'all' ? 'text-[#f64e26]' : 'text-zinc-400'} />
            <span>AGENCIA (TODOS)</span>
          </button>

          <button 
            onClick={() => setShowClientModal(true)}
            className="w-full h-9 bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold px-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm mb-3 text-xs"
          >
            <UserPlus size={15} />
            <span>NUEVO CLIENTE</span>
          </button>

          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Clientes</span>
            <button onClick={() => setShowArchived(!showArchived)} className="text-[10px] text-zinc-400 hover:text-white underline">
              {showArchived ? 'Ocultar' : 'Ver archivados'}
            </button>
          </div>

          <div className="space-y-1 overflow-y-auto flex-1 pr-1">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between group ${
                  selectedClientId === client.id 
                    ? 'bg-zinc-700/60 text-white font-bold' 
                    : 'text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: client.color }}></div>
                  <span className="truncate">{client.name}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-700/40 mt-4 mb-2">
            <button 
              onClick={() => setShowCotizadorModal(true)}
              className="w-full h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-3 rounded-lg flex items-center justify-center gap-2 transition-all text-xs border border-zinc-700/60 shadow-sm"
            >
              <Calculator size={14} className="text-[#f64e26]" />
              <span>Cotizador de Fee</span>
            </button>
          </div>
        </aside>

        {/* ÁREA DE TRABAJO */}
        <main className="flex-1 flex flex-col overflow-hidden">
          
          <header className={`border-b px-8 pt-4 pb-3 flex items-center justify-between no-print ${bgHeader}`}>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                {selectedClientId === 'all' ? 'VISTA CONSOLIDADA' : 'CLIENTE SELECCIONADO'}
              </span>
              <h1 className={`text-lg font-bold tracking-tight flex items-center gap-2 ${textTitle}`}>
                {selectedClientId === 'all' ? 'Agencia - Todos los Clientes' : activeClientObj?.name}
                {activeClientObj && selectedClientId !== 'all' && (
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeClientObj.color }}></div>
                )}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-lg">
                <BarChart2 size={15} className="text-[#f64e26]" />
                <div className="text-xs">
                  <span className="text-slate-500">Pauta: </span>
                  <span className="font-bold text-slate-900">{publishedCount}/{totalPostsCount} Publicados</span>
                </div>
                <div className="w-20 bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#f64e26] h-full transition-all" style={{ width: `${pautaProgress}%` }}></div>
                </div>
              </div>

              {selectedClientId !== 'all' && activeClientObj && (
                <button 
                  onClick={openEditClientModal}
                  className="h-9 px-3.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Settings size={14} className="text-[#f64e26]" />
                  <span>Gestionar Cliente</span>
                </button>
              )}
            </div>
          </header>

          <div className="px-8 pt-3 bg-white border-b border-slate-200/60 flex items-center justify-between no-print">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('contenido')}
                className={`pb-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'contenido' ? 'border-[#f64e26] text-[#f64e26]' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CalendarIcon size={14} />
                <span>Calendario Contenido</span>
              </button>

              <button
                onClick={() => setActiveTab('grabacion')}
                className={`pb-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'grabacion' ? 'border-[#f64e26] text-[#f64e26]' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Video size={14} />
                <span>Calendario Rodajes</span>
              </button>

              <button
                onClick={() => setActiveTab('tareas')}
                className={`pb-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === 'tareas' ? 'border-[#f64e26] text-[#f64e26]' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckSquare size={14} />
                <span>Gestor de Tareas</span>
              </button>

              {selectedClientId !== 'all' && (
                <button
                  onClick={() => setActiveTab('brand')}
                  className={`pb-2 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
                    activeTab === 'brand' ? 'border-[#f64e26] text-[#f64e26]' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Palette size={14} />
                  <span>Kit de Marca</span>
                </button>
              )}
            </div>

            {activeTab === 'tareas' && (
              <div className="flex items-center gap-3 mb-2">
                <div className="relative flex items-center">
                  <Filter size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
                  <select 
                    value={priorityFilter} 
                    onChange={(e) => setPriorityFilter(e.target.value)} 
                    className="bg-white border border-slate-200/80 text-slate-700 text-xs font-bold pl-8 pr-7 py-1.5 rounded-lg focus:outline-none focus:border-[#f64e26] shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="all">Todas las prioridades</option>
                    <option value="Alta">Prioridad Alta</option>
                    <option value="Media">Prioridad Media</option>
                    <option value="Baja">Prioridad Baja</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-2 text-slate-400 pointer-events-none" />
                </div>

                <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200/50">
                  <button onClick={() => setTaskViewMode('kanban')} className={`p-1.5 rounded-md text-xs flex items-center gap-1 ${taskViewMode === 'kanban' ? 'bg-[#f64e26] text-white font-bold' : 'text-slate-600'}`}>
                    <KanbanIcon size={13} />
                    <span>Kanban</span>
                  </button>
                  <button onClick={() => setTaskViewMode('list')} className={`p-1.5 rounded-md text-xs flex items-center gap-1 ${taskViewMode === 'list' ? 'bg-[#f64e26] text-white font-bold' : 'text-slate-600'}`}>
                    <List size={13} />
                    <span>Lista</span>
                  </button>
                  <button onClick={() => setTaskViewMode('calendar')} className={`p-1.5 rounded-md text-xs flex items-center gap-1 ${taskViewMode === 'calendar' ? 'bg-[#f64e26] text-white font-bold' : 'text-slate-600'}`}>
                    <CalendarIcon size={13} />
                    <span>Calendario</span>
                  </button>
                  <button onClick={() => setTaskViewMode('gantt')} className={`p-1.5 rounded-md text-xs flex items-center gap-1 ${taskViewMode === 'gantt' ? 'bg-[#f64e26] text-white font-bold' : 'text-slate-600'}`}>
                    <BarChart3 size={13} />
                    <span>Gantt</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'contenido' && (
              <div className="relative flex items-center mb-2">
                <Filter size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
                <select 
                  value={networkFilter} 
                  onChange={(e) => setNetworkFilter(e.target.value)} 
                  className="bg-white border border-slate-200/80 text-slate-700 text-xs font-bold pl-8 pr-7 py-1.5 rounded-lg focus:outline-none focus:border-[#f64e26] shadow-sm appearance-none cursor-pointer"
                >
                  <option value="all">Todas las redes sociales</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Facebook">Facebook</option>
                  <option value="LinkedIn">LinkedIn</option>
                </select>
                <ChevronDown size={13} className="absolute right-2 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

          {selectedClientId === 'all' && (
            <div className="px-8 py-4 bg-[#f1f2f4] border-b grid grid-cols-4 gap-4 no-print">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Facturación Mensual</span>
                  <span className="text-lg font-black text-slate-900">${globalTotalFee.toLocaleString('es-CL')}</span>
                </div>
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg"><DollarSign size={18} /></div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Recaudación Real</span>
                  <span className="text-lg font-black text-emerald-600">${globalTotalAbonado.toLocaleString('es-CL')}</span>
                </div>
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp size={18} /></div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Entregables Publicados</span>
                  <span className="text-lg font-black text-slate-900">{publishedCount}/{totalPostsCount}</span>
                </div>
                <div className="p-2.5 bg-orange-100 text-[#f64e26] rounded-lg"><BarChart2 size={18} /></div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Tareas Pendientes</span>
                  <span className="text-lg font-black text-amber-600">{globalPendingTasks}</span>
                </div>
                <div className="p-2.5 bg-amber-100 text-amber-600 rounded-lg"><Clock size={18} /></div>
              </div>
            </div>
          )}

          <div className="flex-1 flex overflow-hidden p-6 gap-6 bg-[#f9f9fb]">
            
            <div className="flex-1 flex flex-col min-w-0">

              {(activeTab === 'contenido' || activeTab === 'grabacion' || (activeTab === 'tareas' && taskViewMode === 'calendar')) && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className={`flex items-center justify-between mb-3 p-3 rounded-xl border border-slate-200/60 no-print ${bgTaskCard}`}>
                    <div className="flex items-center gap-3">
                      <h2 className={`text-sm font-bold ${textTitle}`}>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </h2>
                      <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200/60 p-0.5 rounded-lg">
                        <button onClick={() => setCalendarGridMode('month')} className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${calendarGridMode === 'month' ? 'bg-[#f64e26] text-white shadow-sm' : 'text-slate-600'}`}>Mes</button>
                        <button onClick={() => setCalendarGridMode('week')} className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${calendarGridMode === 'week' ? 'bg-[#f64e26] text-white shadow-sm' : 'text-slate-600'}`}>Semana</button>
                      </div>
                    </div>

                    <button
                      onClick={() => openAddModalForDate('2026-08-10')}
                      className="h-9 px-3.5 bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Plus size={15} />
                      <span>{activeTab === 'contenido' ? 'Nuevo Contenido' : activeTab === 'grabacion' ? 'Nuevo Rodaje' : 'Nueva Tarea'}</span>
                    </button>
                  </div>

                  <div className={`flex-1 rounded-2xl border border-slate-200/60 flex flex-col min-h-0 overflow-hidden ${bgTaskCard}`}>
                    <div className={`grid grid-cols-7 border-b ${gridBorderColor} text-center text-[11px] font-bold text-slate-500 py-2`}>
                      <div>DOM</div><div>LUN</div><div>MAR</div><div>MIÉ</div><div>JUE</div><div>VIE</div><div>SÁB</div>
                    </div>

                    <div className="grid grid-cols-7 flex-1 overflow-y-auto">
                      {calendarDays.map((d, index) => {
                        if (!d.isCurrentMonth && calendarGridMode === 'month') return <div key={index} className={`border-r border-b ${gridBorderColor} opacity-20 p-2 min-h-[90px]`}></div>;

                        const dayPosts = filteredPosts.filter(p => p.date === d.fullDate);
                        const dayShoots = filteredShoots.filter(s => s.date === d.fullDate);

                        return (
                          <div key={index} onClick={() => openAddModalForDate(d.fullDate)} className={`border-r border-b ${gridBorderColor} p-2 min-h-[100px] hover:bg-[#f64e26]/5 transition-all cursor-pointer flex flex-col group relative`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-slate-500 group-hover:text-[#f64e26]">{d.day}</span>
                              <Plus size={13} className="text-slate-400 opacity-40 group-hover:opacity-100" />
                            </div>

                            <div className="space-y-1.5 overflow-y-auto max-h-[75px] pr-0.5">
                              {activeTab === 'contenido' && dayPosts.map(p => {
                                const isPublished = p.status === 'Publicado';
                                return (
                                  <div 
                                    key={p.id} 
                                    className={`text-[10px] p-1.5 rounded-lg border-l-2 font-semibold flex items-center justify-between gap-1 group/card transition-all ${
                                      isPublished 
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                                        : 'bg-slate-100 border-[#f64e26] text-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          togglePostPublished(p.id);
                                        }}
                                        className="hover:scale-110 transition-transform shrink-0"
                                      >
                                        {isPublished ? (
                                          <CheckCircle size={13} className="text-emerald-600 fill-emerald-100" />
                                        ) : (
                                          <Circle size={13} className="text-slate-400 hover:text-[#f64e26]" />
                                        )}
                                      </button>
                                      <span className={`truncate ${isPublished ? 'line-through text-emerald-700/80' : ''}`}>
                                        {p.networks?.join(', ')}: {p.topic || p.format}
                                      </span>
                                    </div>

                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDuplicatePost(p); }} 
                                      title="Duplicar Post" 
                                      className="p-0.5 hover:text-[#f64e26] opacity-0 group-hover/card:opacity-100 transition-opacity shrink-0"
                                    >
                                      <Copy size={11} />
                                    </button>
                                  </div>
                                );
                              })}

                              {activeTab === 'grabacion' && dayShoots.map(s => {
                                const isDone = s.status === 'Realizado';
                                return (
                                  <div 
                                    key={s.id} 
                                    className={`text-[10px] p-1.5 rounded-lg border-l-2 font-semibold flex items-center justify-between gap-1 transition-all ${
                                      isDone 
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                                        : 'bg-amber-50 border-amber-500 text-amber-900'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0 truncate">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleShootDone(s.id);
                                        }}
                                        className="hover:scale-110 transition-transform shrink-0"
                                      >
                                        {isDone ? (
                                          <CheckCircle size={13} className="text-emerald-600 fill-emerald-100" />
                                        ) : (
                                          <Circle size={13} className="text-amber-500/60 hover:text-amber-600" />
                                        )}
                                      </button>
                                      <span className={`truncate ${isDone ? 'line-through text-emerald-700/80' : ''}`}>
                                        📹 {s.time} - {s.location}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* KANBAN */}
              {activeTab === 'tareas' && taskViewMode === 'kanban' && (
                <div className="grid grid-cols-3 gap-6 flex-1 overflow-x-auto overflow-y-hidden">
                  {(['Por Hacer', 'En Proceso', 'Completado'] as const).map(columnStatus => {
                    const colTasks = filteredTasks.filter(t => t.status === columnStatus);
                    return (
                      <div key={columnStatus} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, columnStatus)} className={`rounded-2xl p-4 flex flex-col ${bgKanbanCol}`}>
                        <div className="flex items-center justify-between mb-4 px-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-extrabold ${textTitle}`}>{columnStatus === 'Por Hacer' ? 'Tareas pendientes' : columnStatus === 'Completado' ? 'Finalizado' : columnStatus}</h3>
                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">{colTasks.length}</span>
                          </div>
                          <button onClick={() => openTaskModal(undefined, columnStatus)} className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg">
                            <Plus size={15} />
                          </button>
                        </div>

                        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                          {colTasks.map(task => {
                            const c = clients.find(cl => cl.id === task.clientId);
                            return (
                              <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} onClick={() => openTaskModal(task)} className={`p-4 rounded-xl border border-slate-200/60 cursor-pointer transition-all ${bgTaskCard} group/tcard`}>
                                <div className="flex items-start gap-3 mb-3 justify-between">
                                  <div className="flex items-start gap-2.5 flex-1">
                                    <button onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, task.status === 'Completado' ? 'Por Hacer' : 'Completado'); }} className="mt-0.5 shrink-0">
                                      {task.status === 'Completado' ? <CheckCircle size={18} className="text-emerald-500 fill-emerald-100" /> : <Circle size={18} className="text-slate-400 hover:text-emerald-500" />}
                                    </button>
                                    <span className={`text-xs font-extrabold leading-relaxed flex-1 ${task.status === 'Completado' ? 'line-through text-slate-400' : textTitle}`}>{task.title}</span>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); handleDuplicateTask(task); }} title="Clonar Tarea" className="text-slate-400 hover:text-[#f64e26] opacity-0 group-hover/tcard:opacity-100 transition-opacity p-1">
                                    <Copy size={13} />
                                  </button>
                                </div>

                                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 pl-7">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center border border-white shadow-sm shrink-0">
                                      {task.assignee?.substring(0, 1) || 'C'}
                                    </div>
                                    <span className="text-emerald-600 font-extrabold">{task.deadline}</span>
                                  </div>

                                  {selectedClientId === 'all' && c && (
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded text-black" style={{ backgroundColor: c.color }}>{c.name}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          <button onClick={() => openTaskModal(undefined, columnStatus)} className="w-full py-2.5 text-xs text-slate-500 hover:bg-slate-200/50 rounded-xl flex items-center justify-center gap-1.5 font-semibold">
                            <Plus size={14} /> <span>Agregar tarea</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* LISTA */}
              {activeTab === 'tareas' && taskViewMode === 'list' && (
                <div className={`flex-1 flex flex-col min-h-0 rounded-2xl border border-slate-200/60 p-6 space-y-6 overflow-y-auto ${bgTaskCard}`}>
                  {(['Por Hacer', 'En Proceso', 'Completado'] as const).map(groupStatus => {
                    const groupTasks = filteredTasks.filter(t => t.status === groupStatus);
                    return (
                      <div key={groupStatus} className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-xs font-extrabold uppercase tracking-wider ${textTitle}`}>{groupStatus}</h3>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{groupTasks.length}</span>
                          </div>
                          <button onClick={() => openTaskModal(undefined, groupStatus)} className="text-xs text-[#f64e26] hover:underline flex items-center gap-1 font-semibold">
                            <Plus size={13} />
                            <span>Agregar a {groupStatus}</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {groupTasks.length === 0 ? (
                            <div className="text-xs text-slate-400 italic py-2 px-2 bg-slate-50 rounded-lg border">
                              Sin tareas en esta etapa. <button onClick={() => openTaskModal(undefined, groupStatus)} className="text-[#f64e26] font-bold hover:underline">Clic aquí para agregar una.</button>
                            </div>
                          ) : (
                            groupTasks.map(task => {
                              const c = clients.find(cl => cl.id === task.clientId);
                              return (
                                <div key={task.id} onClick={() => openTaskModal(task)} className="border border-slate-200/60 p-3.5 rounded-xl flex items-center justify-between hover:border-[#f64e26]/60 cursor-pointer transition-all bg-white shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <button onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, task.status === 'Completado' ? 'Por Hacer' : 'Completado'); }}>
                                      {task.status === 'Completado' ? <CheckCircle size={18} className="text-emerald-500 fill-emerald-100" /> : <Circle size={18} className="text-slate-400" />}
                                    </button>
                                    <div>
                                      <span className={`text-xs font-bold block ${task.status === 'Completado' ? 'line-through text-slate-400' : textTitle}`}>{task.title}</span>
                                      <span className="text-[10px] text-slate-500">Deadline: {task.deadline} • Responsable: {task.assignee}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleDuplicateTask(task); }} title="Clonar Tarea" className="p-1 hover:text-[#f64e26] text-slate-400"><Copy size={13} /></button>
                                    {selectedClientId === 'all' && c && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-black" style={{ backgroundColor: c.color }}>{c.name}</span>}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* GANTT */}
              {activeTab === 'tareas' && taskViewMode === 'gantt' && (
                <div className={`flex-1 flex flex-col min-h-0 rounded-2xl border border-slate-200/60 p-5 overflow-hidden ${bgTaskCard}`}>
                  <div className="flex items-center justify-between mb-4 border-b pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Escala:</span>
                      <button onClick={() => setGanttScale('days')} className={`px-3 py-1 rounded-lg text-xs font-bold ${ganttScale === 'days' ? 'bg-[#f64e26] text-white' : 'bg-slate-100 text-slate-600'}`}>Días (1-31)</button>
                      <button onClick={() => setGanttScale('weeks')} className={`px-3 py-1 rounded-lg text-xs font-bold ${ganttScale === 'weeks' ? 'bg-[#f64e26] text-white' : 'bg-slate-100 text-slate-600'}`}>Semanas (S1-S4)</button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-x-auto overflow-y-auto">
                    <div className="min-w-[950px] flex flex-col">
                      <div className="flex border-b border-slate-200/60 text-[10px] font-bold text-slate-500 pb-2 mb-3 py-2 bg-slate-50/50 rounded-lg">
                        <div className="w-64 shrink-0 px-3 flex items-center gap-2"><Layers size={13} /> TAREA / ETAPA</div>
                        <div className="flex-1 grid grid-cols-31 text-center border-l border-slate-200/60">
                          {Array.from({ length: 31 }, (_, i) => {
                            const dayNum = i + 1;
                            const dayInitial = getDayInitial(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
                            return (
                              <div key={i} className={`flex flex-col items-center justify-center ${dayNum === 10 ? 'text-[#f64e26] font-black bg-orange-100 rounded-md' : ''}`}>
                                <span className="text-[9px] opacity-60">{dayInitial}</span>
                                <span>{dayNum}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {(['Por Hacer', 'En Proceso', 'Completado'] as const).map(stage => {
                          const stageTasks = filteredTasks.filter(t => t.status === stage);
                          if (stageTasks.length === 0) return null;

                          return (
                            <div key={stage} className="space-y-2">
                              <div className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider px-2 border-b border-slate-200/60 pb-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#f64e26]"></span>
                                <span>{stage === 'Por Hacer' ? 'Tareas pendientes' : stage === 'Completado' ? 'Finalizado' : stage}</span>
                              </div>

                              {stageTasks.map(task => {
                                const startDay = parseInt(task.startDate?.split('-')[2] || '1', 10);
                                const endDay = parseInt(task.deadline?.split('-')[2] || '15', 10);

                                return (
                                  <div key={task.id} onClick={() => openTaskModal(task)} className="flex items-center text-xs hover:bg-slate-50 py-1.5 px-2 rounded-xl cursor-pointer">
                                    <div className="w-64 shrink-0 pr-3 truncate">
                                      <span className="font-bold block text-slate-800 truncate">{task.title}</span>
                                    </div>
                                    <div className="flex-1 relative h-9 bg-slate-50 rounded-xl overflow-hidden flex items-center border border-slate-100">
                                      <div className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10" style={{ left: `${(9 / 31) * 100}%` }}></div>
                                      
                                      <div 
                                        className="absolute h-7 rounded-xl text-[10px] font-bold text-slate-800 bg-white border border-slate-200/80 shadow-sm px-2 flex items-center gap-2 transition-all truncate" 
                                        style={{ left: `${((startDay - 1) / 31) * 100}%`, width: `${Math.max(12, ((endDay - startDay + 1) / 31) * 100)}%` }}
                                      >
                                        <div className="w-5 h-5 rounded-full bg-slate-300 font-black text-[9px] text-slate-800 flex items-center justify-center shrink-0">
                                          {task.assignee?.substring(0, 1) || 'C'}
                                        </div>
                                        <span className="truncate font-bold">{task.title}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* KIT DE MARCA */}
              {activeTab === 'brand' && activeClientObj && (
                <div className={`flex-1 rounded-2xl border border-slate-200/60 p-6 space-y-8 overflow-y-auto ${bgTaskCard}`}>
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h2 className={`text-lg font-bold ${textTitle}`}>Kit de Marca: {activeClientObj.name}</h2>
                      <p className="text-xs text-slate-500 mt-1">{activeClientObj.description}</p>
                    </div>
                    {activeClientObj.driveUrl && (
                      <a href={activeClientObj.driveUrl} target="_blank" rel="noreferrer" className="bg-[#f64e26] text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow">
                        <ExternalLink size={15} />
                        <span>Abrir Nube / Drive</span>
                      </a>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon size={15} className="text-[#f64e26]" /> Logotipos de Marca
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                      {activeClientObj.logos?.map((logo) => (
                        <div key={logo.id} className="p-3.5 rounded-2xl border border-slate-200/60 bg-slate-50/50 flex flex-col justify-between relative group">
                          <button onClick={() => handleDeleteLogo(logo.id)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={13} />
                          </button>
                          <div className="h-32 rounded-xl bg-white border border-slate-200/60 p-2 flex items-center justify-center overflow-hidden mb-3">
                            <img src={logo.imageUrl} alt={logo.name} className="max-h-full max-w-full object-contain" />
                          </div>
                          <span className="text-xs font-bold text-slate-800">{logo.name}</span>
                        </div>
                      ))}

                      <div className="p-4 rounded-2xl border border-slate-200/60 bg-slate-50/50 space-y-3">
                        <span className="text-xs font-bold text-slate-800 block">Agregar Nuevo Logo</span>
                        <input type="text" placeholder="Nombre logo" value={newLogoName} onChange={(e) => setNewLogoName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                        <label className="cursor-pointer bg-slate-200/60 hover:bg-slate-300/60 text-slate-800 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all justify-center">
                          <Upload size={14} className="text-[#f64e26]" />
                          <span>Subir desde Mac / PC</span>
                          <input type="file" accept="image/*" onChange={handleLogoFileSelect} className="hidden" />
                        </label>
                        <button onClick={handleAddLogoToBrand} className="bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold py-2 rounded-lg text-xs w-full shadow-sm">+ Guardar Logo</button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Folder size={15} className="text-[#f64e26]" /> Banco de Recursos y Archivos de Marca
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      {activeClientObj.brandAssets?.map((asset) => (
                        <div key={asset.id} className="p-3.5 rounded-xl border border-slate-200/60 bg-slate-50/50 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <Paperclip size={16} className="text-[#f64e26]" />
                            <div>
                              <span className="text-xs font-bold block text-slate-800">{asset.name}</span>
                              <span className="text-[10px] text-slate-500">Categoría: {asset.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={asset.url} target="_blank" rel="noreferrer" className="p-1 text-slate-400 hover:text-slate-800"><ExternalLink size={14} /></a>
                            <button onClick={() => handleDeleteAsset(asset.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/60 bg-slate-50/50 space-y-3">
                      <span className="text-xs font-bold text-slate-800 block">Agregar Recurso o Archivo</span>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Título activo" value={newAssetTitle} onChange={(e) => setNewAssetTitle(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                        <select value={newAssetCategory} onChange={(e) => setNewAssetCategory(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-xs">
                          <option>Logo</option><option>Manual</option><option>Vector</option><option>Plantilla</option>
                        </select>
                      </div>
                      <label className="cursor-pointer bg-slate-200/60 hover:bg-slate-300/60 text-slate-800 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all w-fit">
                        <Upload size={14} className="text-[#f64e26]" />
                        <span>Subir archivo desde PC / Mac</span>
                        <input type="file" onChange={handleAssetFileSelect} className="hidden" />
                      </label>
                      <input type="url" placeholder="O pega link Nube (Drive, Dropbox)" value={newAssetUrl} onChange={(e) => setNewAssetUrl(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                      <button onClick={handleAddAssetToBrand} className="bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold py-2 rounded-lg text-xs w-full shadow-sm">+ Guardar Recurso</button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* COLUMNA DERECHA */}
            <div className="w-80 flex flex-col gap-5 no-print">
              <div className={`rounded-2xl border border-slate-200/60 p-4 ${bgTaskCard}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <DollarSign size={14} className="text-[#f64e26]" />
                    <span>Control Financiero</span>
                  </h3>
                  {activeClientObj && (
                    <button onClick={openPaymentModal} className="h-8 px-2.5 bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold text-[11px] rounded-lg transition-all shadow-sm">
                      + Registrar Pago
                    </button>
                  )}
                </div>

                {selectedClientId !== 'all' && activeClientObj ? (
                  <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/60 space-y-2.5 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Mensualidad:</span><span className="font-extrabold">${activeClientObj.monthlyFee?.toLocaleString('es-CL')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Total Abonado:</span><span className="font-bold text-emerald-600">${totalAbonado.toLocaleString('es-CL')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Saldo Pendiente:</span><span className="font-bold text-red-500">${saldoPendiente > 0 ? saldoPendiente.toLocaleString('es-CL') : 0}</span></div>
                    <div className="flex justify-between pt-2 border-t"><span className="text-slate-500">Estado:</span><span className="font-bold text-emerald-600 px-2 py-0.5 rounded bg-emerald-100">{activeClientObj.paymentStatus}</span></div>

                    {activeClientObj.abonos && activeClientObj.abonos.length > 0 && (
                      <div className="pt-2 border-t space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Abonos Registrados:</span>
                        {activeClientObj.abonos.map(ab => (
                          <div key={ab.id} className="text-[10px] bg-white p-1.5 rounded border border-slate-200/60 flex justify-between">
                            <span>{ab.date} ({ab.note}):</span>
                            <span className="font-bold text-emerald-600">${ab.amount.toLocaleString('es-CL')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Selecciona un proyecto.</div>
                )}
              </div>

              <div className={`rounded-2xl border border-slate-200/60 p-4 ${bgTaskCard}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <Video size={14} className="text-[#f64e26]" />
                  <span>Próximos Rodajes</span>
                </h3>

                <div className="space-y-2">
                  {filteredShoots.slice(0, 2).map((s) => (
                    <div key={s.id} className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-200/60 text-xs">
                      <div className="font-bold text-slate-800">{s.location}</div>
                      <div className="text-[10px] text-[#f64e26] mt-0.5">{s.date} a las {s.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </main>

      </div>

      {/* MODALES */}
      {showCotizadorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 ${bgTaskCard}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className={`text-base font-bold flex items-center gap-2 ${textTitle}`}>
                <Calculator size={18} className="text-[#f64e26]" /> Cotizador de Fee Mensual
              </h3>
              <button onClick={() => setShowCotizadorModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <input type="text" placeholder="Nombre de la marca / prospecto" value={cotizador.clientName} onChange={(e) => setCotizador({...cotizador, clientName: e.target.value})} className="w-full border rounded-lg p-2.5 text-xs font-bold" />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">N° Reels al mes</label>
                <input type="number" value={cotizador.reels} onChange={(e) => setCotizador({...cotizador, reels: Number(e.target.value)})} className="w-full border rounded-lg p-2 text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">N° Fotos / Carruseles</label>
                <input type="number" value={cotizador.fotos} onChange={(e) => setCotizador({...cotizador, fotos: Number(e.target.value)})} className="w-full border rounded-lg p-2 text-xs" />
              </div>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Fee Mensual Sugerido</span>
              <span className="text-2xl font-black text-[#f64e26]">${calculatedFee.toLocaleString('es-CL')} / mes</span>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowCotizadorModal(false)} className="px-4 py-2 text-xs text-slate-500">Cerrar</button>
              <button onClick={handleCreateClientFromCotizador} className="bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm">+ Crear Cliente con esta Tarifa</button>
            </div>
          </div>
        </div>
      )}

      {showClientModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${bgTaskCard}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className={`text-base font-bold ${textTitle}`}>Nuevo Cliente / Proyecto</h3>
              <button onClick={() => setShowClientModal(false)}><X size={18} className="text-zinc-400" /></button>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Nombre del Cliente / Marca (*)</label>
              <input type="text" placeholder="Ej: Mitz Bar Lounge, Aloha Chic" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})} className="w-full border rounded-lg p-2.5 text-xs font-bold" />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Color Identificatorio de Marca</label>
              <div className="flex items-center gap-3">
                <input type="color" value={newClient.color} onChange={(e) => setNewClient({...newClient, color: e.target.value})} className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer" />
                <span className="text-xs font-mono font-bold text-slate-700">{newClient.color}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Descripción / Rubro del Cliente</label>
              <textarea placeholder="Síntesis del servicio o tipo de contrato..." value={newClient.description} onChange={(e) => setNewClient({...newClient, description: e.target.value})} className="w-full border rounded-lg p-2 text-xs h-16"></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">Valor Mensualidad ($)</label>
                <input type="number" placeholder="Ej: 450000" value={newClient.monthlyFee || ''} onChange={(e) => setNewClient({...newClient, monthlyFee: Number(e.target.value)})} className="w-full border rounded-lg p-2 text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">Día de Cobro Pactado</label>
                <input type="text" placeholder="Ej: 05 de cada mes" value={newClient.paymentDueDate} onChange={(e) => setNewClient({...newClient, paymentDueDate: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Link a Carpeta Google Drive / Nube</label>
              <input type="url" placeholder="https://drive.google.com/..." value={newClient.driveUrl} onChange={(e) => setNewClient({...newClient, driveUrl: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Tono de Voz / Pautas de Comunicación</label>
              <input type="text" placeholder="Ej: Juvenil, festivo, dinámico y muy visual" value={newClient.brandVoice} onChange={(e) => setNewClient({...newClient, brandVoice: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button onClick={() => setShowClientModal(false)} className="px-4 py-2 text-xs text-slate-500">Cancelar</button>
              <button onClick={handleCreateClientFull} className="bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm">Crear Cliente</button>
            </div>
          </div>
        </div>
      )}

      {showEditClientModal && editClientForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${bgTaskCard}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className={`text-base font-bold ${textTitle}`}>Gestionar / Editar Cliente</h3>
              <button onClick={() => setShowEditClientModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Nombre del Cliente / Marca</label>
              <input type="text" value={editClientForm.name} onChange={(e) => setEditClientForm({...editClientForm, name: e.target.value})} className="w-full border rounded-lg p-2.5 text-xs font-bold" />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Color Identificatorio de Marca</label>
              <div className="flex items-center gap-3">
                <input type="color" value={editClientForm.color} onChange={(e) => setEditClientForm({...editClientForm, color: e.target.value})} className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer" />
                <span className="text-xs font-mono font-bold text-slate-700">{editClientForm.color}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Descripción del Proyecto</label>
              <textarea value={editClientForm.description} onChange={(e) => setEditClientForm({...editClientForm, description: e.target.value})} className="w-full border rounded-lg p-2 text-xs h-16"></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">Mensualidad ($)</label>
                <input type="number" value={editClientForm.monthlyFee || 0} onChange={(e) => setEditClientForm({...editClientForm, monthlyFee: Number(e.target.value)})} className="w-full border rounded-lg p-2 text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">Día de Cobro</label>
                <input type="text" value={editClientForm.paymentDueDate || ''} onChange={(e) => setEditClientForm({...editClientForm, paymentDueDate: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Link a Google Drive / Nube Principal</label>
              <input type="url" value={editClientForm.driveUrl || ''} onChange={(e) => setEditClientForm({...editClientForm, driveUrl: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Tono de Voz / Lineamientos de Comunicación</label>
              <input type="text" value={editClientForm.brandVoice || ''} onChange={(e) => setEditClientForm({...editClientForm, brandVoice: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex gap-2">
                <button onClick={() => handleToggleArchiveClient(editClientForm.id)} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all">
                  {editClientForm.archived ? 'Desarchivar' : 'Archivar'}
                </button>
                <button onClick={() => handleDeleteClient(editClientForm.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all">
                  <Trash2 size={15} />
                </button>
              </div>

              <button onClick={handleSaveEditedClient} className="bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition-all">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && activeClientObj && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 ${bgTaskCard}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className={`text-base font-bold ${textTitle}`}>Gestión Financiera - {activeClientObj.name}</h3>
              <button onClick={() => setShowPaymentModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Valor Mensual ($)</label>
                <input type="number" value={paymentForm.monthlyFee} onChange={(e) => setPaymentForm({...paymentForm, monthlyFee: Number(e.target.value)})} className="w-full border rounded-lg p-2 text-xs font-bold" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Estado de Pago</label>
                <select value={paymentForm.paymentStatus} onChange={(e) => setPaymentForm({...paymentForm, paymentStatus: e.target.value as any})} className="w-full border rounded-lg p-2 text-xs">
                  <option value="Pagado">Pagado</option>
                  <option value="Abonado">Abonado (Parcial)</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Facturado">Facturado</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Registrar Nuevo Abono</span>
              <input type="number" placeholder="Monto abonado ($)" value={paymentForm.abonoAmount || ''} onChange={(e) => setPaymentForm({...paymentForm, abonoAmount: Number(e.target.value)})} className="w-full bg-white border rounded-lg p-2 text-xs" />
              <input type="text" placeholder="Nota / Detalle" value={paymentForm.abonoNote} onChange={(e) => setPaymentForm({...paymentForm, abonoNote: e.target.value})} className="w-full bg-white border rounded-lg p-2 text-xs" />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-xs text-slate-500">Cancelar</button>
              <button onClick={handleSavePaymentInfo} className="bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm">Guardar Finanzas</button>
            </div>
          </div>
        </div>
      )}

      {showPostModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${bgTaskCard}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className={`text-base font-bold ${textTitle}`}>Programar Contenido ({selectedDateForModal})</h3>
              <button onClick={() => setShowPostModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Canales de Publicación</label>
              <div className="flex flex-wrap gap-2">
                {availableNetworks.map(net => (
                  <button key={net} type="button" onClick={() => toggleNetworkInPost(net)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${newPost.networks.includes(net) ? 'bg-[#f64e26] text-white border-[#f64e26]' : 'bg-slate-100 text-slate-600'}`}>{net} {newPost.networks.includes(net) && '✓'}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] text-slate-500 block mb-1">Hora</label><input type="time" value={newPost.time} onChange={(e) => setNewPost({...newPost, time: e.target.value})} className="w-full border rounded-lg p-2 text-xs" /></div>
              <div><label className="text-[10px] text-slate-500 block mb-1">Formato</label><select value={newPost.format} onChange={(e) => setNewPost({...newPost, format: e.target.value})} className="w-full border rounded-lg p-2 text-xs"><option>Reel</option><option>Carrusel</option><option>Imagen Estática</option><option>Short</option></select></div>
            </div>

            <div><label className="text-[10px] text-slate-500 block mb-1">Tema / Asunto</label><input type="text" placeholder="Ej: Lanzamiento producto" value={newPost.topic} onChange={(e) => setNewPost({...newPost, topic: e.target.value})} className="w-full border rounded-lg p-2 text-xs" /></div>
            <div><label className="text-[10px] text-slate-500 block mb-1">Copy / Texto</label><textarea placeholder="Copy completo..." value={newPost.copy} onChange={(e) => setNewPost({...newPost, copy: e.target.value})} className="w-full border rounded-lg p-2 text-xs h-20"></textarea></div>

            <div className="space-y-2 pt-2 border-t">
              <input type="url" placeholder="Link de Nube (Drive, Canva)" value={newPost.assetUrl} onChange={(e) => setNewPost({...newPost, assetUrl: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
              
              <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border text-slate-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all w-fit">
                <Upload size={14} className="text-[#f64e26]" />
                <span>{newPost.fileName ? `✓ ${newPost.fileName}` : 'Adjuntar archivo desde Mac / PC'}</span>
                <input type="file" onChange={(e) => setNewPost({...newPost, fileName: e.target.files?.[0]?.name || ''})} className="hidden" />
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              <button onClick={() => setShowPostModal(false)} className="px-4 py-2 text-xs text-slate-500">Cancelar</button>
              <button onClick={handleSavePost} className="bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm">Guardar Post</button>
            </div>
          </div>
        </div>
      )}

      {showShootModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${bgTaskCard}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className={`text-base font-bold ${textTitle}`}>Agendar Rodaje ({selectedDateForModal})</h3>
              <button onClick={() => setShowShootModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] text-slate-500 block mb-1">Hora Citación</label><input type="time" value={newShoot.time} onChange={(e) => setNewShoot({...newShoot, time: e.target.value})} className="w-full border rounded-lg p-2 text-xs" /></div>
              <div><label className="text-[10px] text-slate-500 block mb-1">Locación / Dirección</label><input type="text" placeholder="Ej: Terraza del local" value={newShoot.location} onChange={(e) => setNewShoot({...newShoot, location: e.target.value})} className="w-full border rounded-lg p-2 text-xs" /></div>
            </div>

            <div><label className="text-[10px] text-slate-500 block mb-1">Guion / Escaleta</label><textarea placeholder="Toma 1: Preparación..." value={newShoot.script} onChange={(e) => setNewShoot({...newShoot, script: e.target.value})} className="w-full border rounded-lg p-2 text-xs h-20"></textarea></div>
            <div><label className="text-[10px] text-slate-500 block mb-1">Equipamiento</label><input type="text" placeholder="Aro de luz, cámara 4K" value={newShoot.assets} onChange={(e) => setNewShoot({...newShoot, assets: e.target.value})} className="w-full border rounded-lg p-2 text-xs" /></div>
            <div><label className="text-[10px] text-slate-500 block mb-1">Participantes</label><input type="text" placeholder="Cris, Camila, Barman" value={newShoot.participants} onChange={(e) => setNewShoot({...newShoot, participants: e.target.value})} className="w-full border rounded-lg p-2 text-xs" /></div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              <button onClick={() => setShowShootModal(false)} className="px-4 py-2 text-xs text-slate-500">Cancelar</button>
              <button onClick={handleSaveShoot} className="bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm">Guardar Rodaje</button>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${bgTaskCard}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className={`text-base font-bold ${textTitle}`}>{selectedTaskForEdit ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
              <button onClick={() => setShowTaskModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Zap size={13} className="text-[#f64e26]" /> Cargar Plantilla Rápida:
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => applyTaskTemplate('reel')} className="bg-white hover:bg-slate-100 border text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-bold">🎬 Producción Reel</button>
                <button type="button" onClick={() => applyTaskTemplate('parrilla')} className="bg-white hover:bg-slate-100 border text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-bold">📅 Parrilla Redes</button>
              </div>
            </div>

            <input type="text" placeholder="Título de la tarea..." value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} className="w-full border rounded-lg p-2.5 text-xs font-bold" />

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] text-slate-500 block mb-1">Fecha Inicio</label><input type="date" value={taskForm.startDate} onChange={(e) => setTaskForm({...taskForm, startDate: e.target.value})} className="w-full border rounded-lg p-2 text-xs" /></div>
              <div><label className="text-[10px] text-slate-500 block mb-1">Fecha Límite</label><input type="date" value={taskForm.deadline} onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})} className="w-full border rounded-lg p-2 text-xs" /></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-[10px] text-slate-500 block mb-1">Etapa</label><select value={taskForm.status} onChange={(e) => setTaskForm({...taskForm, status: e.target.value as any})} className="w-full border rounded-lg p-2 text-xs"><option value="Por Hacer">Por Hacer</option><option value="En Proceso">En Proceso</option><option value="Completado">Completado</option></select></div>
              <div><label className="text-[10px] text-slate-500 block mb-1">Prioridad</label><select value={taskForm.priority} onChange={(e) => setTaskForm({...taskForm, priority: e.target.value as any})} className="w-full border rounded-lg p-2 text-xs"><option value="Alta">Alta</option><option value="Media">Media</option><option value="Baja">Baja</option></select></div>
              <div><label className="text-[10px] text-slate-500 block mb-1">Responsable</label><input type="text" value={taskForm.assignee} onChange={(e) => setTaskForm({...taskForm, assignee: e.target.value})} className="w-full border rounded-lg p-2 text-xs" /></div>
            </div>

            <textarea placeholder="Descripción detallada..." value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.target.value})} className="w-full border rounded-lg p-2 text-xs h-20"></textarea>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 block font-bold">Subtareas / Checklist</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Nueva subtarea..." value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} className="flex-1 border rounded-lg p-2 text-xs" />
                <button type="button" onClick={addSubtaskToForm} className="bg-[#f64e26] text-white px-3 rounded-lg text-xs font-bold">+</button>
              </div>

              <div className="space-y-1.5 max-h-28 overflow-y-auto pt-1">
                {taskForm.subtasks.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={sub.completed} onChange={() => {
                        setTaskForm(prev => ({
                          ...prev,
                          subtasks: prev.subtasks.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s)
                        }));
                      }} />
                      <span className={sub.completed ? 'line-through text-slate-400' : 'text-slate-700'}>{sub.title}</span>
                    </div>
                    <button type="button" onClick={() => removeSubtaskFromForm(sub.id)} className="text-slate-400 hover:text-red-500 text-xs">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-xs text-slate-500">Cancelar</button>
              <button onClick={handleSaveTaskForm} className="bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm">{selectedTaskForEdit ? 'Guardar Cambios' : 'Crear Tarea'}</button>
            </div>
          </div>
        </div>
      )}

      {showClientModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${bgTaskCard}`}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className={`text-base font-bold ${textTitle}`}>Nuevo Cliente / Proyecto</h3>
              <button onClick={() => setShowClientModal(false)}><X size={18} className="text-zinc-400" /></button>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Nombre del Cliente / Marca (*)</label>
              <input type="text" placeholder="Ej: Mitz Bar Lounge, Aloha Chic" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})} className="w-full border rounded-lg p-2.5 text-xs font-bold" />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Color Identificatorio de Marca</label>
              <div className="flex items-center gap-3">
                <input type="color" value={newClient.color} onChange={(e) => setNewClient({...newClient, color: e.target.value})} className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer" />
                <span className="text-xs font-mono font-bold text-slate-700">{newClient.color}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Descripción / Rubro del Cliente</label>
              <textarea placeholder="Síntesis del servicio o tipo de contrato..." value={newClient.description} onChange={(e) => setNewClient({...newClient, description: e.target.value})} className="w-full border rounded-lg p-2 text-xs h-16"></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">Valor Mensualidad ($)</label>
                <input type="number" placeholder="Ej: 450000" value={newClient.monthlyFee || ''} onChange={(e) => setNewClient({...newClient, monthlyFee: Number(e.target.value)})} className="w-full border rounded-lg p-2 text-xs" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">Día de Cobro Pactado</label>
                <input type="text" placeholder="Ej: 05 de cada mes" value={newClient.paymentDueDate} onChange={(e) => setNewClient({...newClient, paymentDueDate: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Link a Carpeta Google Drive / Nube</label>
              <input type="url" placeholder="https://drive.google.com/..." value={newClient.driveUrl} onChange={(e) => setNewClient({...newClient, driveUrl: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1 font-bold">Tono de Voz / Pautas de Comunicación</label>
              <input type="text" placeholder="Ej: Juvenil, festivo, dinámico y muy visual" value={newClient.brandVoice} onChange={(e) => setNewClient({...newClient, brandVoice: e.target.value})} className="w-full border rounded-lg p-2 text-xs" />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button onClick={() => setShowClientModal(false)} className="px-4 py-2 text-xs text-slate-500">Cancelar</button>
              <button onClick={handleCreateClientFull} className="bg-[#f64e26] hover:bg-[#e03e17] text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm">Crear Cliente</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}