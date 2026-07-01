// frontend/src/components/rep/RevokeControlModal.tsx
import React, { useState, useEffect } from 'react';
import {
  X, AlertTriangle, Loader2, Users, CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { repService, RepUser } from '../../services/rep.service.js';

interface RevokeControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (assignmentId: string, newUserId?: string) => Promise<void>;
  assignmentId: string;
  controlName: string;
  controlId: string;
  currentUserName: string;
  currentUserId: string;
  repId: string;
  isSubmitting?: boolean;
}

export const RevokeControlModal: React.FC<RevokeControlModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  assignmentId,
  controlName,
  controlId,
  currentUserName,
  currentUserId,
  repId,
  isSubmitting = false,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [users, setUsers] = useState<RepUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserList, setShowUserList] = useState(false);

  // Carregar lista de usuários disponíveis
  useEffect(() => {
    if (isOpen && showUserList) {
      loadUsers();
    }
  }, [isOpen, showUserList]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setError(null);
    try {
      const response = await repService.listUsers({
        page: 1,
        limit: 100,
        status: 'active',
      });
      // Filtrar o usuário atual da lista
      const filteredUsers = response.items.filter(
        (u) => u._id !== currentUserId
      );
      setUsers(filteredUsers);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar lista de usuários');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleConfirm = () => {
    // Se reatribuição foi escolhida, validar se um usuário foi selecionado
    if (showUserList && !selectedUserId) {
      setError('Selecione um usuário para reatribuir o controle');
      return;
    }

    const newUserId = showUserList ? selectedUserId : undefined;
    onConfirm(assignmentId, newUserId);
  };

  const handleToggleReassign = () => {
    setShowUserList(!showUserList);
    if (!showUserList) {
      setSelectedUserId('');
    }
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Revogar Controle</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="space-y-4">
          {/* Informações do controle */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Controle:</strong> {controlId} - {controlName}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Usuário atual:</strong> {currentUserName}
            </p>
          </div>

          {/* Aviso */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Atenção!</p>
              <p>
                Ao revogar este controle, ele será removido do usuário atual.
                {!showUserList && ' Você pode optar por reatribuí-lo a outro usuário.'}
              </p>
            </div>
          </div>

          {/* Opção de reatribuição */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleReassign}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                showUserList
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
              disabled={isSubmitting}
            >
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                {showUserList ? 'Reatribuir para:' : 'Reatribuir para outro usuário'}
              </span>
              {showUserList && (
                <CheckCircle className="h-4 w-4 text-blue-600" />
              )}
            </button>
          </div>

          {/* Lista de usuários para reatribuição */}
          {showUserList && (
            <div className="space-y-3">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-500">Carregando usuários...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>Não há outros usuários ativos disponíveis.</p>
                  <p className="text-sm">O controle será apenas revogado.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {users.map((user) => (
                    <label
                      key={user._id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedUserId === user._id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="newUser"
                        value={user._id}
                        checked={selectedUserId === user._id}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.department && (
                          <p className="text-xs text-gray-400">{user.department}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleConfirm}
              disabled={isSubmitting || (showUserList && !selectedUserId)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {showUserList ? 'Revogar e Reatribuir' : 'Revogar Controle'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevokeControlModal;