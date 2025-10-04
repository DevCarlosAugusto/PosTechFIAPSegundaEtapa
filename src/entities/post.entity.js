import { EntitySchema } from 'typeorm';

export const PostEntity = new EntitySchema({
    name: 'Post',
    tableName: 'posts',
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true,
        },
        title: {
            type: String,
            length: 30,
            nullable: false,
        },
        content: {
            type: 'text', // Tipo TEXT para muito conteúdo
            nullable: false,
        },
        created_at: {
            type: Date,
            createDate: true,
            nullable: false,
        },
        edited_at: {
            type: Date,
            updateDate: true, // TypeORM lida com o update (opcional)
            nullable: true,
        },
    },
    // Relações (Chaves Estrangeiras)
    relations: {
        createdBy: {
            type: 'many-to-one',
            target: 'User', // Nome da Entity referenciada
            joinColumn: {
                name: 'created_by', // Nome da coluna FK na tabela 'posts'
            },
            nullable: false,
            onDelete: 'CASCADE', // ON DELETE CASCADE
        },
        editedBy: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: {
                name: 'edited_by', // Nome da coluna FK na tabela 'posts'
            },
            nullable: true, // A coluna 'edited_by' é opcional
            onDelete: 'SET NULL', // ON DELETE SET NULL
        },
    },
});
