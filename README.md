# back-end-tf-web
Back-End do trabalho final da disciplina de WEB

URL API: https://back-end-tf-web-i3bt.vercel.app/?authuser=0

[GET] /usuario/id
Descrição: Retorna um único usuário.
[POST] /usuario
Descrição: Cadastra um usuário.
Body:
{
  "nome": "Nome do usuário",
  "senha": "***",
  "email": "email-usuario@email.com"
}
[PUT] /usuario/{id}

Descrição: Atualiza dados do usuário.

Body:

```json
{
  "nome": "Nome do usuário",
  "senha": "***",
  "email": "email-usuario@email.com"
}
```

[DELETE] /usuario/{id}

Descrição: Exclui um único usuário.
