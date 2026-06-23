"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlController = void 0;
const Control_js_1 = require("../models/Control.js");
const logger_js_1 = require("../utils/logger.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class ControlController {
    /**
     * Lista todos os controles com paginação e filtros
     */
    static async listControls(req, res, next) {
        try {
            const { page = 1, limit = 20, search, dominio, tipo, nota, propriedade, } = req.query;
            const filter = {};
            // Filtro por domínio
            if (dominio) {
                filter.dominioDeSI = { $in: [dominio] };
            }
            // Filtro por tipo de controle
            if (tipo) {
                filter.tipoDeControle = { $in: [tipo] };
            }
            // Filtro por nota
            if (nota) {
                filter.nota = nota;
            }
            // Filtro por propriedade de SI
            if (propriedade) {
                filter.propriedadeDeSI = { $in: [propriedade] };
            }
            // Busca por texto (ID ou nome)
            if (search) {
                filter.$or = [
                    { id: { $regex: search, $options: 'i' } },
                    { nome: { $regex: search, $options: 'i' } },
                ];
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [controls, total] = await Promise.all([
                Control_js_1.Control.find(filter)
                    .select('_id id nome tiposDeControles nota controles tipoDeControle propriedadeDeSI conceitoDeSegurancaCibernetica capacidadesOperacionais dominioDeSI createdAt updatedAt')
                    .collation({ locale: 'pt', numericOrdering: true })
                    .lean()
                    .skip(skip)
                    .limit(Number(limit))
                    .sort({ id: 1 }),
                Control_js_1.Control.countDocuments(filter),
            ]);
            const totalPages = Math.ceil(total / Number(limit));
            res.json({
                success: true,
                data: { controls },
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages,
                    hasNext: Number(page) < totalPages,
                    hasPrevious: Number(page) > 1,
                },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao listar controles:', error);
            next(error);
        }
    }
    /**
     * Busca um controle por ID
     */
    static async getControlById(req, res, next) {
        try {
            const { id } = req.params;
            const control = await Control_js_1.Control.findById(id)
                .select('_id id nome tiposDeControles nota controles tipoDeControle propriedadeDeSI conceitoDeSegurancaCibernetica capacidadesOperacionais dominioDeSI createdAt updatedAt')
                .lean();
            if (!control) {
                throw new errorHandler_js_1.AppError('Controle não encontrado', 404);
            }
            res.json({
                success: true,
                data: { control },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao buscar controle:', error);
            next(error);
        }
    }
    /**
     * Busca controles por domínio
     */
    static async getControlsByDomain(req, res, next) {
        try {
            const { dominio } = req.params;
            const controls = await Control_js_1.Control.find({
                dominioDeSI: { $in: [dominio] },
            })
                .select('_id id nome nota')
                .lean()
                .sort({ id: 1 });
            res.json({
                success: true,
                data: { controls },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao buscar controles por domínio:', error);
            next(error);
        }
    }
    /**
     * Obtém estatísticas dos controles
     */
    static async getControlStats(req, res, next) {
        try {
            const [total, byNota, byDominio, byTipo] = await Promise.all([
                Control_js_1.Control.countDocuments({}),
                Control_js_1.Control.aggregate([
                    { $group: { _id: '$nota', count: { $sum: 1 } } },
                ]),
                Control_js_1.Control.aggregate([
                    { $unwind: '$dominioDeSI' },
                    { $group: { _id: '$dominioDeSI', count: { $sum: 1 } } },
                ]),
                Control_js_1.Control.aggregate([
                    { $unwind: '$tipoDeControle' },
                    { $group: { _id: '$tipoDeControle', count: { $sum: 1 } } },
                ]),
            ]);
            res.json({
                success: true,
                data: {
                    total,
                    byNota,
                    byDominio,
                    byTipo,
                },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao obter estatísticas dos controles:', error);
            next(error);
        }
    }
    /**
     * Cria um novo controle
     */
    static async createControl(_req, res, next) {
        try {
            const { id, nome, tiposDeControles, nota, controles, cenarioIdentificado, tipoDeControle, propriedadeDeSI, conceitoDeSegurancaCibernetica, capacidadesOperacionais, dominioDeSI, } = _req.body;
            // Validações básicas
            if (!id || !nome) {
                throw new errorHandler_js_1.AppError('ID e Nome são obrigatórios', 400);
            }
            // Verificar se já existe
            const existing = await Control_js_1.Control.findOne({ id });
            if (existing) {
                throw new errorHandler_js_1.AppError(`Controle com ID ${id} já existe`, 400);
            }
            const control = new Control_js_1.Control({
                id,
                nome,
                tiposDeControles: tiposDeControles || [],
                nota: nota || '',
                controles: controles || '',
                cenarioIdentificado: cenarioIdentificado || '',
                tipoDeControle: tipoDeControle || [],
                propriedadeDeSI: propriedadeDeSI || [],
                conceitoDeSegurancaCibernetica: conceitoDeSegurancaCibernetica || [],
                capacidadesOperacionais: capacidadesOperacionais || [],
                dominioDeSI: dominioDeSI || [],
            });
            await control.save();
            logger_js_1.logger.info(`Controle ${control.id} criado por ${_req.user?.email}`);
            res.status(201).json({
                success: true,
                data: { control },
                statusCode: 201,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao criar controle:', error);
            next(error);
        }
    }
    /**
     * Atualiza um controle existente
     */
    static async updateControl(req, res, next) {
        try {
            const { id } = req.params;
            const { nome, tiposDeControles, nota, controles, cenarioIdentificado, tipoDeControle, propriedadeDeSI, conceitoDeSegurancaCibernetica, capacidadesOperacionais, dominioDeSI, } = req.body;
            // Verificar se o controle existe
            const existing = await Control_js_1.Control.findById(id);
            if (!existing) {
                throw new errorHandler_js_1.AppError('Controle não encontrado', 404);
            }
            // Construir objeto de atualização
            const updateData = {};
            if (nome !== undefined)
                updateData.nome = nome;
            if (tiposDeControles !== undefined)
                updateData.tiposDeControles = tiposDeControles;
            if (nota !== undefined)
                updateData.nota = nota;
            if (controles !== undefined)
                updateData.controles = controles;
            if (cenarioIdentificado !== undefined)
                updateData.cenarioIdentificado = cenarioIdentificado;
            if (tipoDeControle !== undefined)
                updateData.tipoDeControle = tipoDeControle;
            if (propriedadeDeSI !== undefined)
                updateData.propriedadeDeSI = propriedadeDeSI;
            if (conceitoDeSegurancaCibernetica !== undefined)
                updateData.conceitoDeSegurancaCibernetica = conceitoDeSegurancaCibernetica;
            if (capacidadesOperacionais !== undefined)
                updateData.capacidadesOperacionais = capacidadesOperacionais;
            if (dominioDeSI !== undefined)
                updateData.dominioDeSI = dominioDeSI;
            const control = await Control_js_1.Control.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
            logger_js_1.logger.info(`Controle ${control?.id} atualizado por ${req.user?.email}`);
            res.json({
                success: true,
                data: { control },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao atualizar controle:', error);
            next(error);
        }
    }
    /**
     * Deleta um controle
     */
    static async deleteControl(req, res, next) {
        try {
            const { id } = req.params;
            const control = await Control_js_1.Control.findByIdAndDelete(id);
            if (!control) {
                throw new errorHandler_js_1.AppError('Controle não encontrado', 404);
            }
            logger_js_1.logger.info(`Controle ${control.id} deletado por ${req.user?.email}`);
            res.json({
                success: true,
                message: 'Controle deletado com sucesso',
                data: { id: control.id },
                statusCode: 200,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_js_1.logger.error('Erro ao deletar controle:', error);
            next(error);
        }
    }
}
exports.ControlController = ControlController;
//# sourceMappingURL=ControlController.js.map