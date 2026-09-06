import { FastifyReply, FastifyRequest } from "fastify";
import {
  createStudentSchema,
  studentFilterQuerySchema,
  studentIdParamSchema,
} from "../dto/students.dto.js";
import { StudentsService, studentsService as defaultStudentsService } from "../services/students.service.js";

export class StudentsHandler {
  constructor(private readonly service: StudentsService = defaultStudentsService) {}

  /**
   * POST /students
   */
  createStudent = async (request: FastifyRequest, reply: FastifyReply) => {
    const validatedBody = createStudentSchema.parse(request.body);
    const student = await this.service.createStudent(validatedBody);
    return reply.status(201).send(student);
  };

  /**
   * GET /students/:id
   */
  getStudentById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = studentIdParamSchema.parse(request.params);
    const student = await this.service.getStudentById(id);
    return reply.status(200).send(student);
  };

  /**
   * DELETE /students/:id
   */
  deleteStudent = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = studentIdParamSchema.parse(request.params);
    await this.service.deleteStudent(id);
    return reply.status(204).send();
  };

  /**
   * GET /students
   */
  listStudents = async (request: FastifyRequest, reply: FastifyReply) => {
    const validatedQuery = studentFilterQuerySchema.parse(request.query);
    const result = await this.service.listStudents(validatedQuery);
    return reply.status(200).send(result);
  };
}

export const studentsHandler = new StudentsHandler();
