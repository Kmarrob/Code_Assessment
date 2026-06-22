# scripts/apply-ux-part4.ps1
# Script para implementar UX & Usabilidade - Parte 4/5 (Empty States e Micro-interações)

param(
    [string]$BaseDir = "C:\Users\marcio.souza\Documents\MRS_CONSULTORIA\Code_Assessment"
)

$ErrorActionPreference = 'Stop'

# Cores
$Colors = @{
    Header = 'Cyan'
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Blue'
    Step = 'Magenta'
}

function Write-Step {
    param($Message)
    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor $Colors.Header
    Write-Host "║ $Message" -ForegroundColor $Colors.Header
    Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor $Colors.Header
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor $Colors.Success
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️ $Message" -ForegroundColor $Colors.Info
}

# ============================================
# HEADER
# ============================================
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CODE_ASSESSMENT - UX & USABILIDADE (PILAR 4)            ║" -ForegroundColor Cyan
Write-Host "║     PARTE 4/5 - EMPTY STATES E MICRO-INTERAÇÕES            ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PARTE 1: EMPTY STATE
# ============================================
Write-Step "PARTE 1/4: EMPTY STATE"

Write-Info "Criando EmptyState.tsx..."
@'
// frontend/src/components/ui/EmptyState.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';
import { Button } from './Button.js';
import { Plus, Search, FileText, Users, ClipboardList } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: {
    icon: 'h-12 w-12',
    title: 'text-lg',
    description: 'text-sm',
    spacing: 'space-y-3',
  },
  md: {
    icon: 'h-16 w-16',
    title: 'text-xl',
    description: 'text-base',
    spacing: 'space-y-4',
  },
  lg: {
    icon: 'h-20 w-20',
    title: 'text-2xl',
    description: 'text-lg',
    spacing: 'space-y-6',
  },
};

const emptyStateIcons = {
  plus: Plus,
  search: Search,
  file: FileText,
  users: Users,
  clipboard: ClipboardList,
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  size = 'md',
}) => {
  const IconComponent = typeof icon === 'string' ? emptyStateIcons[icon as keyof typeof emptyStateIcons] : null;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center p-8 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50',
      sizes[size].spacing,
      className
    )}>
      {icon && (
        <div className={cn(
          'flex items-center justify-center rounded-full bg-gray-100',
          size === 'lg' ? 'p-6' : size === 'md' ? 'p-4' : 'p-3'
        )}>
          {IconComponent ? (
            <IconComponent className={cn('text-gray-400', sizes[size].icon)} />
          ) : (
            <span className={cn('text-gray-400', sizes[size].icon)}>{icon}</span>
          )}
        </div>
      )}

      <div className="space-y-1">
        <h3 className={cn('font-semibold text-gray-900', sizes[size].title)}>
          {title}
        </h3>
        {description && (
          <p className={cn('text-gray-500 max-w-md mx-auto', sizes[size].description)}>
            {description}
          </p>
        )}
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          {actionLabel && onAction && (
            <Button onClick={onAction} size={size === 'sm' ? 'sm' : 'default'}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export const NoDataEmptyState: React.FC<{
  title?: string;
  description?: string;
  onAction?: () => void;
}> = ({
  title = 'Nenhum dado encontrado',
  description = 'Não há registros para exibir no momento.',
  onAction,
}) => (
  <EmptyState
    icon="search"
    title={title}
    description={description}
    actionLabel={onAction ? 'Recarregar' : undefined}
    onAction={onAction}
  />
);

export const NoUsersEmptyState: React.FC<{
  onAddUser?: () => void;
}> = ({ onAddUser }) => (
  <EmptyState
    icon="users"
    title="Nenhum usuário cadastrado"
    description="Comece adicionando seu primeiro usuário ao sistema."
    actionLabel="Adicionar usuário"
    onAction={onAddUser}
  />
);

export const NoControlsEmptyState: React.FC<{
  onAssign?: () => void;
}> = ({ onAssign }) => (
  <EmptyState
    icon="clipboard"
    title="Nenhum controle atribuído"
    description="Os controles da ISO 27001 serão atribuídos a você em breve."
    actionLabel="Ver controles disponíveis"
    onAction={onAssign}
  />
);

export const NoResultsEmptyState: React.FC<{
  query?: string;
  onClear?: () => void;
}> = ({ query, onClear }) => (
  <EmptyState
    icon="search"
    title="Nenhum resultado encontrado"
    description={query 
      ? `Nenhum resultado encontrado para "${query}". Tente ajustar sua busca.`
      : 'Nenhum resultado encontrado. Tente ajustar seus filtros.'
    }
    actionLabel="Limpar busca"
    onAction={onClear}
  />
);
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\EmptyState.tsx" -Encoding UTF8
Write-Success "EmptyState.tsx criado"

# ============================================
# PARTE 2: MICRO INTERAÇÕES
# ============================================
Write-Step "PARTE 2/4: MICRO INTERAÇÕES"

Write-Info "Criando MicroInteractions.tsx..."
@'
// frontend/src/components/ui/MicroInteractions.tsx
import React from 'react';
import { cn } from '../../utils/helpers.js';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AnimatedCheckmarkProps {
  active: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AnimatedCheckmark: React.FC<AnimatedCheckmarkProps> = ({
  active,
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn(
      'transition-all duration-300 transform',
      active ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
      className
    )}>
      <CheckCircle className={cn('text-green-500', sizes[size])} />
    </div>
  );
};

interface PulseIndicatorProps {
  active: boolean;
  color?: 'green' | 'red' | 'yellow' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const pulseColors = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-500',
};

const pulseSizes = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  active,
  color = 'green',
  size = 'md',
  label,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={cn(
          'rounded-full',
          pulseSizes[size],
          pulseColors[color],
          active && 'animate-pulse'
        )} />
        {active && (
          <div className={cn(
            'absolute inset-0 rounded-full animate-ping',
            pulseColors[color],
            'opacity-75'
          )} />
        )}
      </div>
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );
};

interface SuccessToastProps {
  message: string;
  visible: boolean;
  onDismiss?: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  message,
  visible,
  onDismiss,
}) => {
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg shadow-lg transition-all duration-300',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
    )}>
      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
      <span className="text-sm text-green-800">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto text-green-600 hover:text-green-800 transition-colors"
          aria-label="Fechar"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export const LoadingDots: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center gap-1', className)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  delay = 0,
  onComplete,
  className,
}) => {
  const [displayText, setDisplayText] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    let index = 0;

    const startTyping = () => {
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return interval;
    };

    timeout = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span className={cn('font-mono', className)}>
      {displayText}
      {!isComplete && (
        <span className="inline-block h-4 w-0.5 bg-gray-400 ml-0.5 animate-pulse" />
      )}
    </span>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\MicroInteractions.tsx" -Encoding UTF8
Write-Success "MicroInteractions.tsx criado"

# ============================================
# PARTE 3: TRANSITION
# ============================================
Write-Step "PARTE 3/4: TRANSITION"

Write-Info "Criando Transition.tsx..."
@'
// frontend/src/components/ui/Transition.tsx
import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/helpers.js';

interface TransitionProps {
  show: boolean;
  children: React.ReactNode;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  appear?: boolean;
  duration?: number;
  className?: string;
}

export const Transition: React.FC<TransitionProps> = ({
  show,
  children,
  enter = 'transition-all duration-300 ease-out',
  enterFrom = 'opacity-0 scale-95',
  enterTo = 'opacity-100 scale-100',
  leave = 'transition-all duration-200 ease-in',
  leaveFrom = 'opacity-100 scale-100',
  leaveTo = 'opacity-0 scale-95',
  appear = false,
  duration = 300,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(show || appear);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!isVisible) return null;

  const state = isAnimating
    ? (show ? `${enterFrom}` : `${leaveFrom}`)
    : (show ? `${enterTo}` : `${leaveTo}`);

  return (
    <div className={cn(
      enter,
      leave,
      state,
      className
    )}>
      {children}
    </div>
  );
};

export const FadeTransition: React.FC<TransitionProps> = (props) => (
  <Transition
    enter="transition-opacity duration-300"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-opacity duration-200"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
    {...props}
  />
);

export const SlideTransition: React.FC<TransitionProps> = (props) => (
  <Transition
    enter="transition-all duration-300 ease-out"
    enterFrom="opacity-0 -translate-y-4"
    enterTo="opacity-100 translate-y-0"
    leave="transition-all duration-200 ease-in"
    leaveFrom="opacity-100 translate-y-0"
    leaveTo="opacity-0 -translate-y-4"
    {...props}
  />
);

export const ScaleTransition: React.FC<TransitionProps> = (props) => (
  <Transition
    enter="transition-all duration-300 ease-out"
    enterFrom="opacity-0 scale-95"
    enterTo="opacity-100 scale-100"
    leave="transition-all duration-200 ease-in"
    leaveFrom="opacity-100 scale-100"
    leaveTo="opacity-0 scale-95"
    {...props}
  />
);
'@ | Out-File -FilePath "$BaseDir\frontend\src\components\ui\Transition.tsx" -Encoding UTF8
Write-Success "Transition.tsx criado"

# ============================================
# PARTE 4: LANDING PAGE ATUALIZADA
# ============================================
Write-Step "PARTE 4/4: LANDING PAGE ATUALIZADA"

Write-Info "Atualizando LandingPage.tsx..."
@'
// frontend/src/pages/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { FadeTransition } from '../components/ui/Transition.js';
import { Typewriter } from '../components/ui/MicroInteractions.js';
import { Shield, Users, BarChart3, Zap, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Avaliação Completa',
    description: '93 controles da ISO 27001 mapeados e organizados para uma avaliação precisa da maturidade.',
  },
  {
    icon: Users,
    title: 'Gestão de Equipes',
    description: 'Prepostos podem cadastrar usuários e distribuir controles de forma inteligente e sem repetições.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios Detalhados',
    description: 'Visualize o nível de maturidade da organização com gráficos e indicadores claros.',
  },
  {
    icon: Zap,
    title: 'Automação Total',
    description: 'Processo digitalizado com scripts PowerShell para setup rápido e automatizado.',
  },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Code_Assessment</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button>Começar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <FadeTransition show={true}>
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                Transforme seu assessment manual em digital
              </div>
            </FadeTransition>

            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Avalie sua maturidade em
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                <Typewriter
                  text="Segurança da Informação"
                  speed={80}
                  delay={500}
                />
              </span>
            </h1>

            <FadeTransition show={true}>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                Automatize o processo de assessment baseado na ISO 27001, com gestão de usuários,
                controles e relatórios em tempo real.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="text-base">
                    Iniciar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-base">
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </FadeTransition>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tudo o que você precisa para um assessment completo
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Gerencie todo o processo de avaliação de maturidade em um só lugar
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <FadeTransition key={feature.title} show={true}>
                  <div className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-600 mb-4">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </FadeTransition>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 gradient-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-primary-100 max-w-2xl mx-auto mb-8">
              Cadastre-se agora e transforme seu processo de assessment em uma experiência digital e eficiente.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-primary-700 hover:text-primary-800">
                Criar conta gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Code_Assessment. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
'@ | Out-File -FilePath "$BaseDir\frontend\src\pages\LandingPage.tsx" -Encoding UTF8
Write-Success "LandingPage.tsx atualizado"

# ============================================
# FINALIZAÇÃO
# ============================================
Write-Step "✅ PARTE 4/5 CONCLUÍDA!"

Write-Success "Arquivos criados/atualizados:"
Write-Info "  • frontend/src/components/ui/EmptyState.tsx"
Write-Info "  • frontend/src/components/ui/MicroInteractions.tsx"
Write-Info "  • frontend/src/components/ui/Transition.tsx"
Write-Info "  • frontend/src/pages/LandingPage.tsx (atualizado)"

Write-Info ""
Write-Info "📌 Para testar:" -ForegroundColor Cyan
Write-Info "  1. Reinicie o frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Info "  2. Teste EmptyStates em diferentes cenários" -ForegroundColor White
Write-Info "  3. Teste micro-interações (hover, click)" -ForegroundColor White
Write-Info "  4. Teste transições animadas" -ForegroundColor White
Write-Info "  5. Teste Typewriter na landing page" -ForegroundColor White

Write-Success "🎉 Parte 4/5 concluída com sucesso!"