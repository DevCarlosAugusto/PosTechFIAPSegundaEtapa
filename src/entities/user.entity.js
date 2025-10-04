import { EntitySchema } from 'typeorm';

// Definindo o ENUM separadamente para clareza
const UserType = {
    PROFESSOR: 'PROFESSOR',
    ALUNO: 'ALUNO',
};

export const UserEntity = new EntitySchema({
    name: 'User',
    tableName: 'users',
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true,
        },
        nome: {
            type: String,
            length: 30,
            nullable: false,
        },
        user_type: {
            // No PostgreSQL, você define o tipo ENUM como 'enum' e especifica os valores.
            type: 'enum',
            enum: Object.values(UserType),
            nullable: false,
        },
        email: {
            type: String,
            length: 100,
            unique: true,
            nullable: false,
        },
        password_hash: {
            type: String, // Adicionado para autenticação, não foi especificado, mas é padrão
            nullable: false,
        },
        serie: {
            type: String,
            length: 30,
            nullable: true,
        },
        subject: {
            type: String,
            length: 30,
            nullable: true,
        },
        created_at: {
            type: Date,
            createDate: true, // TypeORM lida com o DEFAULT CURRENT_TIMESTAMP
            nullable: false,
        },
    },
    // Relações (necessário para a Entity Post)
    relations: {
        posts: {
            type: 'one-to-many',
            target: 'Post', // Nome da outra Entity
            inverseSide: 'createdBy',
        },
    },
});
