# back-end-tf-web
Back-End do trabalho final da disciplina de WEB
grupo :gilzilene,kaiky,francisco,kauan,eduardo elias

URL API: https://back-end-tf-web-i3bt.vercel.app/

[GET] /usuario/id
Descrição: Retorna um único usuário.
URL: https://back-end-tf-web-i3bt.vercel.app/usuarios/30

[POST] /usuario
Descrição: Cadastra um usuário, o seu nome ,email de contato e a sua senha.
URL: https://back-end-tf-web-i3bt.vercel.app/usuarios


Body:
{
  "nome": "adm",
  "email": "adm@bruno.com",
  "senha": "123"
}


[PUT] /usuario/{id}
URL: https://back-end-tf-web-i3bt.vercel.app/usuarios/30

Descrição: Atualiza dados do usuário.

Body:

{ 
  "nome": "adm",
  "email": "adm55@bruno.com",
  "senha": "12345"
}


[DELETE] /fotos/{id}
URL : https://back-end-tf-web-i3bt.vercel.app/usuarios/29

Descrição: Exclui um único usuário.


[GET] /fotos/id
Descrição: Retorna uma unica foto.
URL: https://back-end-tf-web-i3bt.vercel.app/fotos/:id

[POST] /fotos
Descrição: Cadastra a foto,  o seu tiltulo de descriçao o caminho da imagem e o usuario .

URL :https://back-end-tf-web-i3bt.vercel.app/fotos

Body:
{
  "titulo": "Foto do plano ",
  "caminho_arquivo": "images/foto_teste.png",
  "id_usuario":1
  
}

[PUT] /fotos/{id}
URL: https://back-end-tf-web-i3bt.vercel.app/fotos/22

Descrição: Atualiza dados da foto.

Body:

{
  "titulo": "pranos de estudante oficial",
  "caminho_arquivo": "images/foto_teste.png",
  "id_usuario": 1
}


[DELETE] /fotos/{id}
URL:https://back-end-tf-web-i3bt.vercel.app/fotos/4

Descrição: Exclui uma unica foto.


[GET] /planos/id
Descrição: Retorna uma unica foto.
URL: https://back-end-tf-web-i3bt.vercel.app/planos/:id 

[POST] /´planos
Descrição: Cadastra um novo plano, o seu tiltulo , a descriçao do plano,o seu preço e mostra que o usuario 1 estar cadrastando o plano .

URL: https://back-end-tf-web-i3bt.vercel.app/planos

Body:

{ 
 "nome":"Plano Trimestral",
 "descricao":"Treino por 3 meses com flexibilidade",
 "preco":"189.90",
 "id_usuario":1
}

[PUT] /planos/{id}

Descrição: Atualiza dados dos planos.

URL: https://back-end-tf-web-i3bt.vercel.app/planos/30

Body:

{
  "id_plano": 30,
  "nome": "Plano Trimestral top ",
  "descricao": "Treino por 3 meses com flexibilidade venha conhecer",
  "preco": "189.90",
  "id_usuario": 1
}


[DELETE] /planos/{id}
URL: https://back-end-tf-web-i3bt.vercel.app/planos/69

Descrição: Exclui um unico plano.