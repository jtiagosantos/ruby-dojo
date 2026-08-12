import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const dbPath = dbUrl.startsWith("file:") ? dbUrl.slice(5) : dbUrl;
const resolvedPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.resolve(process.cwd(), dbPath);
const adapter = new PrismaBetterSqlite3({ url: resolvedPath });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const modules = [
  {
    slug: "introducao",
    title: "Introdução ao Ruby",
    description: "Conheça a linguagem Ruby, sua filosofia e como começar.",
    icon: "💎",
    order: 1,
    content: `# Introdução ao Ruby

## O que é Ruby?

Ruby é uma linguagem de programação **dinâmica**, **orientada a objetos** e de **propósito geral**, criada por **Yukihiro "Matz" Matsumoto** no Japão, em 1995.

Matz criou Ruby com um objetivo claro: **tornar os programadores mais felizes**. A filosofia da linguagem prioriza a produtividade e a elegância do código.

> "Ruby is designed to make programmers happy." — Matz

## Características Principais

- **Tudo é objeto**: Em Ruby, absolutamente tudo é um objeto — números, strings, booleanos, e até \`nil\`.
- **Sintaxe expressiva**: O código Ruby se lê quase como inglês.
- **Tipagem dinâmica**: Não é necessário declarar tipos de variáveis.
- **Garbage collection**: Gerenciamento automático de memória.
- **Blocos e iteradores**: Poderosas abstrações para trabalhar com coleções.

## Seu Primeiro Programa Ruby

\`\`\`ruby
puts "Olá, Mundo!"
\`\`\`

Simples assim! O método \`puts\` imprime uma string seguida de uma quebra de linha.

## IRB — Ruby Interativo

O **IRB** (Interactive Ruby) permite executar código Ruby diretamente no terminal:

\`\`\`bash
$ irb
irb(main):001> 2 + 2
=> 4
irb(main):002> "Ruby".length
=> 4
irb(main):003> "Ruby".upcase
=> "RUBY"
\`\`\`

## Comentários

\`\`\`ruby
# Este é um comentário de linha única

=begin
Este é um comentário
de múltiplas linhas
=end
\`\`\`

## Métodos puts, print e p

\`\`\`ruby
puts "Hello"    # imprime com quebra de linha
print "Hello"   # imprime SEM quebra de linha
p "Hello"       # imprime a representação inspecionada (útil para debug)
p 42            # => 42
p [1, 2, 3]     # => [1, 2, 3]
\`\`\`

## Convenções de Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Variável local | snake_case | \`nome_usuario\` |
| Constante | SCREAMING_SNAKE_CASE | \`MAX_VALOR\` |
| Classe/Módulo | PascalCase | \`MinhaClasse\` |
| Método | snake_case | \`calcular_total\` |
| Variável de instância | @snake_case | \`@nome\` |
| Variável de classe | @@snake_case | \`@@contador\` |

## Próximos Passos

Agora que você conhece o básico, vamos aprender sobre **variáveis e tipos de dados** no próximo módulo!
`,
  },
  {
    slug: "variaveis-tipos",
    title: "Variáveis e Tipos de Dados",
    description: "Aprenda sobre variáveis locais, constantes e os tipos básicos do Ruby.",
    icon: "📦",
    order: 2,
    content: `# Variáveis e Tipos de Dados

## Variáveis em Ruby

Em Ruby, você não precisa declarar o tipo de uma variável. Basta atribuir um valor:

\`\`\`ruby
nome = "Alice"
idade = 25
altura = 1.68
ativo = true
\`\`\`

## Tipos Básicos

### Integer (Inteiro)

\`\`\`ruby
x = 42
y = -10
z = 1_000_000   # underscores para legibilidade
\`\`\`

**Operações com inteiros:**

\`\`\`ruby
10 + 3   # => 13
10 - 3   # => 7
10 * 3   # => 30
10 / 3   # => 3 (divisão inteira!)
10 % 3   # => 1 (módulo/resto)
10 ** 2  # => 100 (potência)
\`\`\`

### Float (Ponto Flutuante)

\`\`\`ruby
pi = 3.14159
preco = 19.99
10.0 / 3   # => 3.3333... (divisão real)
\`\`\`

### String

\`\`\`ruby
nome = "Ruby"
mensagem = 'Olá, mundo!'
\`\`\`

### Boolean

\`\`\`ruby
verdadeiro = true
falso = false
\`\`\`

### Nil

\`\`\`ruby
vazio = nil  # representa a ausência de valor
\`\`\`

### Symbol

Symbols são identificadores imutáveis, mais leves que strings:

\`\`\`ruby
status = :ativo
cor = :vermelho
\`\`\`

## Conversões de Tipo

\`\`\`ruby
"42".to_i       # => 42  (string para inteiro)
"3.14".to_f     # => 3.14 (string para float)
42.to_s         # => "42" (inteiro para string)
42.to_f         # => 42.0 (inteiro para float)
3.7.to_i        # => 3 (trunca, não arredonda)
\`\`\`

## Interpolação de Strings

Use \`#{}\ dentro de aspas duplas para interpolar:

\`\`\`ruby
nome = "Alice"
idade = 25
puts "Olá, #{nome}! Você tem #{idade} anos."
# => Olá, Alice! Você tem 25 anos.
puts "Daqui a 5 anos, você terá #{idade + 5} anos."
\`\`\`

## Múltiplas Atribuições

\`\`\`ruby
a, b, c = 1, 2, 3
puts a  # => 1
puts b  # => 2

# Troca de valores sem variável temporária
a, b = b, a
\`\`\`

## Constantes

\`\`\`ruby
PI = 3.14159
VERSAO_APP = "1.0.0"
\`\`\`

## Verificando Tipos

\`\`\`ruby
42.class        # => Integer
"oi".class      # => String
3.14.class      # => Float
true.class      # => TrueClass
nil.class       # => NilClass
:symbol.class   # => Symbol

42.is_a?(Integer)   # => true
42.is_a?(String)    # => false
\`\`\`
`,
  },
  {
    slug: "strings",
    title: "Strings",
    description: "Manipulação completa de strings: métodos, interpolação, formatação e mais.",
    icon: "🔤",
    order: 3,
    content: `# Strings

## Criando Strings

\`\`\`ruby
s1 = "aspas duplas"      # aceita interpolação e caracteres de escape
s2 = 'aspas simples'     # literal, sem interpolação
s3 = String.new("nova")
\`\`\`

## Métodos Essenciais

### Tamanho e Verificações

\`\`\`ruby
"Ruby".length    # => 4
"Ruby".size      # => 4 (alias)
"".empty?        # => true
"Ruby".empty?    # => false
"Ruby Dojo".include?("Ruby")  # => true
\`\`\`

### Transformação de Caso

\`\`\`ruby
"ruby".upcase        # => "RUBY"
"RUBY".downcase      # => "ruby"
"ruby dojo".capitalize  # => "Ruby dojo"
"ruby dojo".split.map(&:capitalize).join(" ")  # => "Ruby Dojo"
\`\`\`

### Remoção de Espaços

\`\`\`ruby
"  ruby  ".strip     # => "ruby"
"  ruby  ".lstrip    # => "ruby  "
"  ruby  ".rstrip    # => "  ruby"
\`\`\`

### Substituição

\`\`\`ruby
"Ruby é legal".gsub("legal", "incrível")  # => "Ruby é incrível"
"abcabc".sub("a", "X")    # => "Xbcabc"  (apenas a primeira ocorrência)
"abcabc".gsub("a", "X")   # => "XbcXbc"  (todas as ocorrências)
"Ruby 2023".gsub(/\d+/, "novo")  # => "Ruby novo"
\`\`\`

### Divisão e União

\`\`\`ruby
"a,b,c".split(",")     # => ["a", "b", "c"]
"Ruby Dojo".split      # => ["Ruby", "Dojo"]
["a", "b", "c"].join("-")  # => "a-b-c"
\`\`\`

### Busca e Índice

\`\`\`ruby
"Ruby".index("u")      # => 1
"abcdef"[2]            # => "c"
"abcdef"[1..3]         # => "bcd"
"abcdef"[-1]           # => "f" (último caractere)
\`\`\`

### Repetição e Concatenação

\`\`\`ruby
"ab" * 3         # => "ababab"
"Olá" + " " + "Mundo"  # => "Olá Mundo"
"Olá" << " Mundo"      # => "Olá Mundo" (modifica in place)
\`\`\`

## Strings Multilinha (Heredoc)

\`\`\`ruby
texto = <<~TEXTO
  Esta é uma string
  de múltiplas linhas.
  Muito útil para textos longos.
TEXTO
puts texto
\`\`\`

## Formatação com format/sprintf

\`\`\`ruby
format("Olá, %s! Você tem %d anos.", "Alice", 25)
# => "Olá, Alice! Você tem 25 anos."

format("Preço: R$ %.2f", 9.5)
# => "Preço: R$ 9.50"
\`\`\`

## Verificações Úteis

\`\`\`ruby
"123".match?(/^\d+$/)    # => true (apenas dígitos)
"abc".start_with?("a")   # => true
"abc".end_with?("c")     # => true
"abc".chars              # => ["a", "b", "c"]
"abc".bytes              # => [97, 98, 99]
\`\`\`
`,
  },
  {
    slug: "arrays",
    title: "Arrays",
    description: "Coleções ordenadas de objetos: criação, manipulação e iteração.",
    icon: "📋",
    order: 4,
    content: `# Arrays

## Criando Arrays

\`\`\`ruby
frutas = ["maçã", "banana", "laranja"]
numeros = [1, 2, 3, 4, 5]
misto = [1, "dois", :tres, true, nil]
vazio = []
intervalo = (1..5).to_a   # => [1, 2, 3, 4, 5]

# Atalho para arrays de strings
palavras = %w[ruby python javascript]  # => ["ruby", "python", "javascript"]
\`\`\`

## Acesso a Elementos

\`\`\`ruby
arr = [10, 20, 30, 40, 50]
arr[0]     # => 10 (primeiro)
arr[-1]    # => 50 (último)
arr[1..3]  # => [20, 30, 40]
arr.first  # => 10
arr.last   # => 50
arr.first(2) # => [10, 20]
arr.last(2)  # => [40, 50]
\`\`\`

## Modificação

\`\`\`ruby
arr = [1, 2, 3]
arr.push(4)      # => [1, 2, 3, 4]
arr << 5         # => [1, 2, 3, 4, 5] (equivalente a push)
arr.pop          # => 5, arr = [1, 2, 3, 4]
arr.unshift(0)   # => [0, 1, 2, 3, 4] (adiciona no início)
arr.shift        # => 0, arr = [1, 2, 3, 4]
arr.insert(2, 99)  # => [1, 2, 99, 3, 4]
\`\`\`

## Informações

\`\`\`ruby
arr = [1, 2, 3, 2, 1]
arr.length   # => 5
arr.size     # => 5
arr.empty?   # => false
arr.include?(2)  # => true
arr.count(2)     # => 2 (quantas vezes 2 aparece)
arr.index(3)     # => 2 (posição do primeiro 3)
arr.sum          # => 9
arr.min          # => 1
arr.max          # => 3
\`\`\`

## Transformação

\`\`\`ruby
[1, 2, 3].map { |n| n * 2 }     # => [2, 4, 6]
[1, 2, 3, 4].select { |n| n.even? }  # => [2, 4]
[1, 2, 3, 4].reject { |n| n.even? }  # => [1, 3]
[3, 1, 2].sort                    # => [1, 2, 3]
[3, 1, 2].sort.reverse            # => [3, 2, 1]
[1, 2, 3].reduce(:+)              # => 6
[1, 2, 3].reduce(10, :+)          # => 16
[[1, 2], [3, 4]].flatten          # => [1, 2, 3, 4]
[1, 2, 2, 3, 3].uniq              # => [1, 2, 3]
[1, 2, 3].reverse                 # => [3, 2, 1]
\`\`\`

## Iteração

\`\`\`ruby
["a", "b", "c"].each { |item| puts item }

["a", "b", "c"].each_with_index do |item, index|
  puts "#{index}: #{item}"
end

["a", "b", "c"].each_with_object([]) do |item, acc|
  acc << item.upcase
end
# => ["A", "B", "C"]
\`\`\`

## Operações de Conjunto

\`\`\`ruby
[1, 2, 3] + [3, 4, 5]   # => [1, 2, 3, 3, 4, 5] (concatenação)
[1, 2, 3] - [2, 3]      # => [1] (diferença)
[1, 2, 3] & [2, 3, 4]   # => [2, 3] (interseção)
[1, 2, 3] | [2, 3, 4]   # => [1, 2, 3, 4] (união)
\`\`\`
`,
  },
  {
    slug: "hashes",
    title: "Hashes",
    description: "Estruturas de dados chave-valor: criação, acesso e iteração.",
    icon: "🗂️",
    order: 5,
    content: `# Hashes

## O que são Hashes?

Hashes são coleções de pares **chave-valor**, similares a dicionários em outras linguagens.

## Criando Hashes

\`\`\`ruby
# Sintaxe com rocket (=>)
pessoa = { "nome" => "Alice", "idade" => 25 }

# Sintaxe com symbols (mais comum e idiomática)
usuario = { nome: "Bob", idade: 30, ativo: true }

# Hash vazio
config = {}
config = Hash.new
config = Hash.new(0)  # valor padrão 0 para chaves inexistentes
\`\`\`

## Acesso e Modificação

\`\`\`ruby
user = { nome: "Alice", idade: 25 }

# Leitura
user[:nome]          # => "Alice"
user[:profissao]     # => nil (chave inexistente)
user.fetch(:nome)    # => "Alice"
user.fetch(:profissao, "N/A")  # => "N/A" (valor padrão)

# Escrita
user[:email] = "alice@email.com"
user[:idade] = 26

# Remoção
user.delete(:email)
\`\`\`

## Informações

\`\`\`ruby
h = { a: 1, b: 2, c: 3 }
h.length      # => 3
h.size        # => 3
h.empty?      # => false
h.has_key?(:a)    # => true
h.key?(:d)        # => false
h.has_value?(2)   # => true
h.value?(5)       # => false
h.keys        # => [:a, :b, :c]
h.values      # => [1, 2, 3]
h.to_a        # => [[:a, 1], [:b, 2], [:c, 3]]
\`\`\`

## Iteração

\`\`\`ruby
h = { nome: "Alice", idade: 25 }

h.each { |chave, valor| puts "#{chave}: #{valor}" }

h.each_key { |k| puts k }
h.each_value { |v| puts v }

# map retorna um array
h.map { |k, v| "#{k}=#{v}" }
# => ["nome=Alice", "idade=25"]
\`\`\`

## Transformação

\`\`\`ruby
{ a: 1, b: 2, c: 3 }.select { |k, v| v > 1 }
# => { b: 2, c: 3 }

{ a: 1, b: 2, c: 3 }.reject { |k, v| v > 1 }
# => { a: 1 }

{ a: 1, b: 2 }.transform_values { |v| v * 10 }
# => { a: 10, b: 20 }

{ a: 1, b: 2 }.transform_keys { |k| k.to_s }
# => { "a" => 1, "b" => 2 }
\`\`\`

## Merge

\`\`\`ruby
h1 = { a: 1, b: 2 }
h2 = { b: 3, c: 4 }

h1.merge(h2)           # => { a: 1, b: 3, c: 4 } (h2 sobrescreve)
h1.merge(h2) { |key, old, new_val| old + new_val }  # => { a: 1, b: 5, c: 4 }
\`\`\`

## Hash como parâmetro de método

\`\`\`ruby
def criar_usuario(nome:, idade:, email: nil)
  puts "#{nome}, #{idade} anos, email: #{email || 'não informado'}"
end

criar_usuario(nome: "Alice", idade: 25)
criar_usuario(nome: "Bob", idade: 30, email: "bob@email.com")
\`\`\`
`,
  },
  {
    slug: "controle-de-fluxo",
    title: "Controle de Fluxo",
    description: "if/else, unless, case/when, operadores ternários e condicionais.",
    icon: "🔀",
    order: 6,
    content: `# Controle de Fluxo

## if / elsif / else

\`\`\`ruby
nota = 75

if nota >= 90
  puts "Aprovado com distinção"
elsif nota >= 60
  puts "Aprovado"
else
  puts "Reprovado"
end
\`\`\`

## if em uma linha (modificador)

\`\`\`ruby
puts "Maior de idade" if idade >= 18
puts "Aviso!" if temperatura > 40
\`\`\`

## unless (contrário de if)

\`\`\`ruby
unless logado
  puts "Faça login primeiro"
end

# ou em uma linha
puts "Visitante" unless logado
\`\`\`

## Operador Ternário

\`\`\`ruby
resultado = nota >= 60 ? "Aprovado" : "Reprovado"
mensagem = ativo ? "online" : "offline"
\`\`\`

## case / when

\`\`\`ruby
dia = "segunda"

case dia
when "segunda", "terça", "quarta", "quinta", "sexta"
  puts "Dia útil"
when "sábado", "domingo"
  puts "Fim de semana"
else
  puts "Dia inválido"
end
\`\`\`

### case com intervalos

\`\`\`ruby
nota = 85

case nota
when 90..100 then puts "A"
when 80..89  then puts "B"
when 70..79  then puts "C"
when 60..69  then puts "D"
else              puts "F"
end
\`\`\`

### case com classes (pattern matching básico)

\`\`\`ruby
valor = 42

case valor
when Integer then puts "É um inteiro"
when String  then puts "É uma string"
when Array   then puts "É um array"
end
\`\`\`

## Operadores Lógicos

\`\`\`ruby
true && false  # => false  (AND)
true || false  # => true   (OR)
!true          # => false  (NOT)

# Versões em inglês (menor precedência)
true and false
true or false
not true
\`\`\`

## Operador de Atribuição Condicional

\`\`\`ruby
x = nil
x ||= 10   # atribui 10 somente se x for nil/false
puts x     # => 10

y = 5
y ||= 10   # y já tem valor, não altera
puts y     # => 5

# && com atribuição
z = 10
z &&= z * 2   # se z for truthy, multiplica por 2
puts z     # => 20
\`\`\`

## Valores Truthy e Falsy

Em Ruby, **apenas \`false\` e \`nil\` são falsy**. Tudo o mais é truthy — inclusive \`0\`, \`""\` e \`[]\`!

\`\`\`ruby
if 0      # => verdadeiro em Ruby!
if ""     # => verdadeiro em Ruby!
if []     # => verdadeiro em Ruby!
if nil    # => falso
if false  # => falso
\`\`\`
`,
  },
  {
    slug: "loops-iteradores",
    title: "Loops e Iteradores",
    description: "while, until, loop, times, each, map, select e outros iteradores do Ruby.",
    icon: "🔄",
    order: 7,
    content: `# Loops e Iteradores

## while

\`\`\`ruby
i = 0
while i < 5
  puts i
  i += 1
end
\`\`\`

## until (contrário de while)

\`\`\`ruby
i = 0
until i >= 5
  puts i
  i += 1
end
\`\`\`

## loop com break

\`\`\`ruby
i = 0
loop do
  break if i >= 5
  puts i
  i += 1
end
\`\`\`

## for...in

\`\`\`ruby
for numero in 1..5
  puts numero
end
\`\`\`

## times

\`\`\`ruby
5.times { puts "Olá!" }

5.times do |i|
  puts "Iteração #{i}"  # 0, 1, 2, 3, 4
end
\`\`\`

## upto e downto

\`\`\`ruby
1.upto(5) { |i| puts i }    # 1, 2, 3, 4, 5
5.downto(1) { |i| puts i }  # 5, 4, 3, 2, 1
\`\`\`

## step

\`\`\`ruby
(1..10).step(2) { |i| puts i }  # 1, 3, 5, 7, 9
0.step(1, 0.25) { |i| puts i }  # 0, 0.25, 0.5, 0.75, 1.0
\`\`\`

## each (o mais Ruby possível)

\`\`\`ruby
[1, 2, 3].each { |n| puts n }

["a", "b", "c"].each_with_index do |item, i|
  puts "#{i}: #{item}"
end
\`\`\`

## next e break dentro de loops

\`\`\`ruby
# next pula para a próxima iteração (como continue em outras linguagens)
(1..10).each do |i|
  next if i.even?
  puts i   # imprime apenas ímpares
end

# break sai do loop
(1..100).each do |i|
  break if i > 5
  puts i   # imprime 1, 2, 3, 4, 5
end
\`\`\`

## Iteradores de Transformação

\`\`\`ruby
# map/collect: transforma cada elemento
[1, 2, 3].map { |n| n ** 2 }    # => [1, 4, 9]

# select/filter: filtra elementos
(1..10).select { |n| n.even? }  # => [2, 4, 6, 8, 10]

# reject: filtra ao contrário
(1..10).reject { |n| n.even? }  # => [1, 3, 5, 7, 9]

# reduce/inject: acumula
(1..5).reduce(:+)               # => 15
(1..5).reduce(100, :+)          # => 115
(1..5).reduce { |acc, n| acc * n }  # => 120 (fatorial)

# find/detect: encontra o primeiro que satisfaz
(1..10).find { |n| n > 5 }      # => 6

# all?, any?, none?
[2, 4, 6].all?(&:even?)         # => true
[1, 2, 3].any?(&:even?)         # => true
[1, 3, 5].none?(&:even?)        # => true

# count com bloco
(1..10).count(&:even?)          # => 5

# flat_map: map + flatten
[[1, 2], [3, 4]].flat_map { |a| a.map { |n| n * 2 } }  # => [2, 4, 6, 8]
\`\`\`

## each_slice e each_cons

\`\`\`ruby
(1..9).each_slice(3) { |s| p s }
# => [1, 2, 3]
# => [4, 5, 6]
# => [7, 8, 9]

(1..5).each_cons(3) { |c| p c }
# => [1, 2, 3]
# => [2, 3, 4]
# => [3, 4, 5]
\`\`\`
`,
  },
  {
    slug: "metodos",
    title: "Métodos",
    description: "Como definir e chamar métodos, parâmetros, valores padrão e retorno.",
    icon: "⚙️",
    order: 8,
    content: `# Métodos

## Definindo e Chamando Métodos

\`\`\`ruby
def saudar
  puts "Olá!"
end

saudar   # => "Olá!"
\`\`\`

## Parâmetros

\`\`\`ruby
def saudar(nome)
  puts "Olá, #{nome}!"
end

saudar("Alice")
saudar "Bob"  # parênteses são opcionais quando não há ambiguidade
\`\`\`

## Valores Padrão

\`\`\`ruby
def saudar(nome, saudacao = "Olá")
  puts "#{saudacao}, #{nome}!"
end

saudar("Alice")           # => "Olá, Alice!"
saudar("Bob", "E aí")     # => "E aí, Bob!"
\`\`\`

## Retorno de Valores

Em Ruby, a última expressão avaliada é automaticamente o valor de retorno:

\`\`\`ruby
def somar(a, b)
  a + b  # retorno implícito
end

def multiplicar(a, b)
  return a * b  # retorno explícito (também funciona)
end

resultado = somar(3, 4)   # => 7
\`\`\`

## Múltiplos Retornos

\`\`\`ruby
def dividir(a, b)
  quociente = a / b
  resto = a % b
  [quociente, resto]  # retorna um array
end

q, r = dividir(10, 3)
puts q  # => 3
puts r  # => 1
\`\`\`

## Parâmetros com Keywords (Named Parameters)

\`\`\`ruby
def criar_usuario(nome:, idade:, email: nil)
  "#{nome}, #{idade} anos"
end

criar_usuario(nome: "Alice", idade: 25)
criar_usuario(idade: 30, nome: "Bob")  # ordem não importa
\`\`\`

## Splat Operator (*)

\`\`\`ruby
def somar(*numeros)
  numeros.sum
end

somar(1, 2, 3)       # => 6
somar(1, 2, 3, 4, 5) # => 15

# Double splat para hashes
def exibir(**opcoes)
  opcoes.each { |k, v| puts "#{k}: #{v}" }
end

exibir(cor: "azul", tamanho: "grande")
\`\`\`

## Métodos com ! e ?

Por convenção:

- Métodos com **?** retornam booleano: \`empty?\`, \`include?\`, \`nil?\`
- Métodos com **!** modificam o objeto in-place (versão destrutiva): \`sort!\`, \`upcase!\`, \`gsub!\`

\`\`\`ruby
arr = [3, 1, 2]
arr.sort    # => [1, 2, 3], arr não é modificado
arr.sort!   # arr agora é [1, 2, 3]

str = "ruby"
str.upcase   # => "RUBY", str não é modificado
str.upcase!  # str agora é "RUBY"
\`\`\`

## Métodos como Blocos (&method)

\`\`\`ruby
[1, 2, 3, 4].select(&method(:odd?))   # não funciona assim
["alice", "bob"].map(&:capitalize)    # => ["Alice", "Bob"]
[1, 2, 3].map(&:to_s)                 # => ["1", "2", "3"]
\`\`\`
`,
  },
  {
    slug: "blocos-procs-lambdas",
    title: "Blocos, Procs e Lambdas",
    description: "Entenda closures em Ruby: blocos, Proc e lambda com suas diferenças.",
    icon: "🧩",
    order: 9,
    content: `# Blocos, Procs e Lambdas

## Blocos

Blocos são pedaços de código que podem ser passados para métodos:

\`\`\`ruby
# Com chaves (para blocos de uma linha)
[1, 2, 3].each { |n| puts n }

# Com do...end (para blocos multilinha)
[1, 2, 3].each do |n|
  puts n
end
\`\`\`

## yield — Chamando o Bloco

\`\`\`ruby
def com_log
  puts "Início"
  yield  # executa o bloco passado
  puts "Fim"
end

com_log { puts "Fazendo algo..." }
# => Início
# => Fazendo algo...
# => Fim
\`\`\`

## yield com parâmetros

\`\`\`ruby
def transformar(arr)
  arr.map { |item| yield item }
end

transformar([1, 2, 3]) { |n| n * 2 }  # => [2, 4, 6]
\`\`\`

## block_given?

\`\`\`ruby
def opcional
  if block_given?
    yield
  else
    puts "Nenhum bloco fornecido"
  end
end
\`\`\`

## Procs

\`\`\`ruby
dobrar = Proc.new { |n| n * 2 }
dobrar.call(5)   # => 10
dobrar.(5)       # => 10 (sintaxe alternativa)
dobrar[5]        # => 10 (outra sintaxe)

# Passando proc para método
[1, 2, 3].map(&dobrar)   # => [2, 4, 6]
\`\`\`

## Lambdas

\`\`\`ruby
somar = lambda { |a, b| a + b }
somar.call(3, 4)   # => 7

# Sintaxe stabby (mais comum)
multiplicar = ->(a, b) { a * b }
multiplicar.call(3, 4)   # => 12
multiplicar.(3, 4)        # => 12
\`\`\`

## Diferenças entre Proc e Lambda

| Característica | Proc | Lambda |
|----------------|------|--------|
| Verificação de argumentos | Não verifica | Verifica estritamente |
| Comportamento de \`return\` | Retorna do método | Retorna do lambda |

\`\`\`ruby
# Lambda verifica argumentos
l = lambda { |a, b| a + b }
l.call(1, 2)    # => 3
# l.call(1)     # ArgumentError!

# Proc não verifica
p = Proc.new { |a, b| a.to_i + b.to_i }
p.call(1, 2)    # => 3
p.call(1)       # => 1 (b é nil, convertido para 0)
\`\`\`

## Closures — Capturando o Contexto

\`\`\`ruby
def criar_contador(inicio = 0)
  count = inicio
  incrementar = -> { count += 1; count }
  decrementar = -> { count -= 1; count }
  [incrementar, decrementar]
end

inc, dec = criar_contador(10)
inc.call   # => 11
inc.call   # => 12
dec.call   # => 11
\`\`\`

## Symbol#to_proc

\`\`\`ruby
[1, 2, 3].map(&:to_s)        # => ["1", "2", "3"]
["a", "b"].map(&:upcase)     # => ["A", "B"]
[nil, 1, false, 2].select(&:itself)  # => [1, 2] (truthy values)
\`\`\`
`,
  },
  {
    slug: "classes-objetos",
    title: "Classes e Objetos",
    description: "Orientação a objetos em Ruby: classes, atributos, herança e módulos.",
    icon: "🏗️",
    order: 10,
    content: `# Classes e Objetos

## Definindo uma Classe

\`\`\`ruby
class Animal
  def initialize(nome, som)
    @nome = nome  # variável de instância
    @som = som
  end

  def falar
    "#{@nome} faz #{@som}!"
  end
end

gato = Animal.new("Gato", "miau")
puts gato.falar   # => "Gato faz miau!"
\`\`\`

## Accessors

\`\`\`ruby
class Pessoa
  attr_reader :nome          # apenas leitura
  attr_writer :email         # apenas escrita
  attr_accessor :idade       # leitura e escrita

  def initialize(nome, idade)
    @nome = nome
    @idade = idade
  end
end

p = Pessoa.new("Alice", 25)
puts p.nome     # => "Alice"
p.idade = 26
puts p.idade    # => 26
\`\`\`

## Métodos de Instância e de Classe

\`\`\`ruby
class Contador
  @@total = 0   # variável de classe

  def initialize
    @@total += 1
    @id = @@total
  end

  def id
    @id
  end

  def self.total   # método de classe
    @@total
  end
end

a = Contador.new
b = Contador.new
puts a.id         # => 1
puts b.id         # => 2
puts Contador.total  # => 2
\`\`\`

## Herança

\`\`\`ruby
class Animal
  def initialize(nome)
    @nome = nome
  end

  def respirar
    "#{@nome} está respirando"
  end
end

class Cachorro < Animal   # < indica herança
  def latir
    "Au au!"
  end

  def apresentar
    "#{respirar} e latindo!"  # acessa método da superclasse
  end
end

rex = Cachorro.new("Rex")
puts rex.latir       # => "Au au!"
puts rex.respirar    # => "Rex está respirando"
puts rex.apresentar
\`\`\`

## super

\`\`\`ruby
class Animal
  def initialize(nome)
    @nome = nome
  end
end

class Gato < Animal
  def initialize(nome, cor)
    super(nome)   # chama initialize da superclasse
    @cor = cor
  end

  def descricao
    "#{@nome} é um gato #{@cor}"
  end
end

g = Gato.new("Mimi", "laranja")
puts g.descricao  # => "Mimi é um gato laranja"
\`\`\`

## Módulos e Mixins

\`\`\`ruby
module Nadavel
  def nadar
    "#{@nome} está nadando!"
  end
end

module Voavel
  def voar
    "#{@nome} está voando!"
  end
end

class Pato < Animal
  include Nadavel
  include Voavel
end

donald = Pato.new("Donald")
puts donald.nadar    # => "Donald está nadando!"
puts donald.voar     # => "Donald está voando!"
\`\`\`

## Comparable — Sobrescrevendo Comparação

\`\`\`ruby
class Produto
  include Comparable

  attr_accessor :nome, :preco

  def initialize(nome, preco)
    @nome = nome
    @preco = preco
  end

  def <=>(outro)
    @preco <=> outro.preco
  end
end

produtos = [
  Produto.new("B", 30),
  Produto.new("A", 10),
  Produto.new("C", 20)
]

produtos.sort.map(&:nome)  # => ["A", "C", "B"]
produtos.min.nome          # => "A"
\`\`\`

## to_s e inspect

\`\`\`ruby
class Ponto
  def initialize(x, y)
    @x, @y = x, y
  end

  def to_s
    "(#{@x}, #{@y})"
  end

  def inspect
    "#<Ponto x=#{@x}, y=#{@y}>"
  end
end

p = Ponto.new(3, 4)
puts p        # => "(3, 4)"
p p           # => #<Ponto x=3, y=4>
\`\`\`
`,
  },
];

const challenges: Array<{
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  points: number;
  moduleSlug: string;
  order: number;
  starterCode: string;
  tests: string;
}> = [
  // === MÓDULO 1: INTRODUÇÃO ===
  {
    title: "Olá, Ruby!",
    description: `## Olá, Ruby!

Escreva um método chamado \`ola\` que retorna a string \`"Olá, Ruby!"\`.

### Exemplo

\`\`\`ruby
ola  # => "Olá, Ruby!"
\`\`\`
`,
    difficulty: "beginner",
    points: 10,
    moduleSlug: "introducao",
    order: 1,
    starterCode: `def ola
  # seu código aqui
end`,
    tests: `class TestOla < Minitest::Test
  def test_retorna_saudacao
    assert_equal "Olá, Ruby!", ola
  end
end`,
  },
  {
    title: "Calculadora Básica",
    description: `## Calculadora Básica

Escreva os métodos \`somar\`, \`subtrair\`, \`multiplicar\` e \`dividir\`, cada um recebendo dois números e retornando o resultado da operação.

### Exemplos

\`\`\`ruby
somar(3, 4)       # => 7
subtrair(10, 3)   # => 7
multiplicar(3, 4) # => 12
dividir(10, 2)    # => 5.0
\`\`\`

> **Nota:** \`dividir\` deve retornar um número de ponto flutuante.
`,
    difficulty: "beginner",
    points: 10,
    moduleSlug: "introducao",
    order: 2,
    starterCode: `def somar(a, b)
  # seu código aqui
end

def subtrair(a, b)
  # seu código aqui
end

def multiplicar(a, b)
  # seu código aqui
end

def dividir(a, b)
  # seu código aqui
end`,
    tests: `class TestCalculadora < Minitest::Test
  def test_somar
    assert_equal 7, somar(3, 4)
    assert_equal 0, somar(-5, 5)
  end

  def test_subtrair
    assert_equal 7, subtrair(10, 3)
    assert_equal -5, subtrair(0, 5)
  end

  def test_multiplicar
    assert_equal 12, multiplicar(3, 4)
    assert_equal 0, multiplicar(0, 100)
  end

  def test_dividir
    assert_equal 5.0, dividir(10, 2)
    assert_in_delta 3.333, dividir(10, 3), 0.001
  end
end`,
  },

  // === MÓDULO 2: VARIÁVEIS E TIPOS ===
  {
    title: "Conversor de Temperatura",
    description: `## Conversor de Temperatura

Escreva os métodos:
- \`celsius_para_fahrenheit(c)\` — converte Celsius para Fahrenheit
- \`fahrenheit_para_celsius(f)\` — converte Fahrenheit para Celsius

### Fórmulas
- **°F = °C × 9/5 + 32**
- **°C = (°F - 32) × 5/9**

### Exemplos

\`\`\`ruby
celsius_para_fahrenheit(0)    # => 32.0
celsius_para_fahrenheit(100)  # => 212.0
fahrenheit_para_celsius(32)   # => 0.0
\`\`\`
`,
    difficulty: "beginner",
    points: 10,
    moduleSlug: "variaveis-tipos",
    order: 1,
    starterCode: `def celsius_para_fahrenheit(celsius)
  # seu código aqui
end

def fahrenheit_para_celsius(fahrenheit)
  # seu código aqui
end`,
    tests: `class TestTemperatura < Minitest::Test
  def test_celsius_para_fahrenheit
    assert_equal 32.0, celsius_para_fahrenheit(0)
    assert_equal 212.0, celsius_para_fahrenheit(100)
    assert_in_delta 98.6, celsius_para_fahrenheit(37), 0.01
  end

  def test_fahrenheit_para_celsius
    assert_equal 0.0, fahrenheit_para_celsius(32)
    assert_equal 100.0, fahrenheit_para_celsius(212)
    assert_in_delta 37.0, fahrenheit_para_celsius(98.6), 0.01
  end
end`,
  },
  {
    title: "IMC — Índice de Massa Corporal",
    description: `## IMC — Índice de Massa Corporal

Escreva um método \`calcular_imc(peso, altura)\` que retorna o IMC calculado pela fórmula:

**IMC = peso / altura²**

E um método \`classificar_imc(imc)\` que retorna a classificação:

| IMC | Classificação |
|-----|--------------|
| < 18.5 | "Abaixo do peso" |
| 18.5..24.9 | "Peso normal" |
| 25.0..29.9 | "Sobrepeso" |
| >= 30 | "Obesidade" |

### Exemplos

\`\`\`ruby
calcular_imc(70, 1.75)     # => 22.86...
classificar_imc(22.86)     # => "Peso normal"
\`\`\`
`,
    difficulty: "intermediate",
    points: 20,
    moduleSlug: "variaveis-tipos",
    order: 2,
    starterCode: `def calcular_imc(peso, altura)
  # seu código aqui
end

def classificar_imc(imc)
  # seu código aqui
end`,
    tests: `class TestIMC < Minitest::Test
  def test_calcular_imc
    assert_in_delta 22.857, calcular_imc(70, 1.75), 0.01
    assert_in_delta 27.778, calcular_imc(90, 1.80), 0.01
  end

  def test_classificar_abaixo_peso
    assert_equal "Abaixo do peso", classificar_imc(17.0)
  end

  def test_classificar_normal
    assert_equal "Peso normal", classificar_imc(22.0)
    assert_equal "Peso normal", classificar_imc(18.5)
  end

  def test_classificar_sobrepeso
    assert_equal "Sobrepeso", classificar_imc(27.0)
  end

  def test_classificar_obesidade
    assert_equal "Obesidade", classificar_imc(31.0)
  end
end`,
  },

  // === MÓDULO 3: STRINGS ===
  {
    title: "Inverter String",
    description: `## Inverter String

Escreva um método \`inverter(str)\` que retorna a string com os caracteres em ordem inversa.

### Exemplos

\`\`\`ruby
inverter("ruby")    # => "ybur"
inverter("hello")   # => "olleh"
inverter("a")       # => "a"
inverter("")        # => ""
\`\`\`

> **Dica:** Ruby tem um método built-in para isso, mas tente resolver sem ele primeiro!
`,
    difficulty: "beginner",
    points: 10,
    moduleSlug: "strings",
    order: 1,
    starterCode: `def inverter(str)
  # seu código aqui
end`,
    tests: `class TestInverter < Minitest::Test
  def test_inverter_ruby
    assert_equal "ybur", inverter("ruby")
  end

  def test_inverter_hello
    assert_equal "olleh", inverter("hello")
  end

  def test_inverter_unico
    assert_equal "a", inverter("a")
  end

  def test_inverter_vazia
    assert_equal "", inverter("")
  end
end`,
  },
  {
    title: "Palindromo",
    description: `## Palíndromo

Escreva um método \`palindromo?(str)\` que retorna \`true\` se a string for um palíndromo (lê-se igual de frente para trás), e \`false\` caso contrário.

A verificação deve ser **case-insensitive** e ignorar espaços.

### Exemplos

\`\`\`ruby
palindromo?("arara")      # => true
palindromo?("Ruby")       # => false
palindromo?("A man a plan a canal Panama".delete(" "))  # => true
\`\`\`
`,
    difficulty: "beginner",
    points: 10,
    moduleSlug: "strings",
    order: 2,
    starterCode: `def palindromo?(str)
  # seu código aqui
end`,
    tests: `class TestPalindromo < Minitest::Test
  def test_palindromo_arara
    assert palindromo?("arara")
  end

  def test_palindromo_ovo
    assert palindromo?("ovo")
  end

  def test_nao_palindromo
    refute palindromo?("ruby")
    refute palindromo?("hello")
  end

  def test_case_insensitive
    assert palindromo?("Ana")
    assert palindromo?("RACECAR")
  end

  def test_unico_caractere
    assert palindromo?("a")
  end
end`,
  },
  {
    title: "Contar Vogais",
    description: `## Contar Vogais

Escreva um método \`contar_vogais(str)\` que retorna o número de vogais na string (a, e, i, o, u — maiúsculas e minúsculas).

### Exemplos

\`\`\`ruby
contar_vogais("ruby")      # => 1
contar_vogais("hello")     # => 2
contar_vogais("AEIOU")     # => 5
contar_vogais("rhythm")    # => 0
\`\`\`
`,
    difficulty: "beginner",
    points: 10,
    moduleSlug: "strings",
    order: 3,
    starterCode: `def contar_vogais(str)
  # seu código aqui
end`,
    tests: `class TestContarVogais < Minitest::Test
  def test_ruby
    assert_equal 1, contar_vogais("ruby")
  end

  def test_hello
    assert_equal 2, contar_vogais("hello")
  end

  def test_maiusculas
    assert_equal 5, contar_vogais("AEIOU")
  end

  def test_sem_vogais
    assert_equal 0, contar_vogais("rhythm")
  end

  def test_vazia
    assert_equal 0, contar_vogais("")
  end
end`,
  },

  // === MÓDULO 4: ARRAYS ===
  {
    title: "Soma de Array",
    description: `## Soma de Array

Escreva um método \`soma(arr)\` que retorna a soma de todos os elementos de um array de números.

Retorne \`0\` para um array vazio.

### Exemplos

\`\`\`ruby
soma([1, 2, 3, 4, 5])   # => 15
soma([])                 # => 0
soma([-1, -2, 3])        # => 0
\`\`\`
`,
    difficulty: "beginner",
    points: 10,
    moduleSlug: "arrays",
    order: 1,
    starterCode: `def soma(arr)
  # seu código aqui
end`,
    tests: `class TestSoma < Minitest::Test
  def test_soma_basica
    assert_equal 15, soma([1, 2, 3, 4, 5])
  end

  def test_soma_vazio
    assert_equal 0, soma([])
  end

  def test_soma_negativos
    assert_equal 0, soma([-1, -2, 3])
  end

  def test_soma_unico
    assert_equal 42, soma([42])
  end
end`,
  },
  {
    title: "Duplicatas",
    description: `## Duplicatas

Escreva um método \`remover_duplicatas(arr)\` que retorna um novo array sem elementos repetidos, mantendo a ordem original.

### Exemplos

\`\`\`ruby
remover_duplicatas([1, 2, 2, 3, 3, 3])  # => [1, 2, 3]
remover_duplicatas(["a", "b", "a"])     # => ["a", "b"]
remover_duplicatas([])                  # => []
\`\`\`
`,
    difficulty: "beginner",
    points: 10,
    moduleSlug: "arrays",
    order: 2,
    starterCode: `def remover_duplicatas(arr)
  # seu código aqui
end`,
    tests: `class TestDuplicatas < Minitest::Test
  def test_numeros
    assert_equal [1, 2, 3], remover_duplicatas([1, 2, 2, 3, 3, 3])
  end

  def test_strings
    assert_equal ["a", "b"], remover_duplicatas(["a", "b", "a"])
  end

  def test_vazio
    assert_equal [], remover_duplicatas([])
  end

  def test_sem_duplicatas
    assert_equal [1, 2, 3], remover_duplicatas([1, 2, 3])
  end
end`,
  },
  {
    title: "Aplanar Array",
    description: `## Aplanar Array

Escreva um método \`aplanar(arr)\` que recebe um array aninhado (de qualquer profundidade) e retorna um array plano (sem aninhamento).

### Exemplos

\`\`\`ruby
aplanar([1, [2, 3]])           # => [1, 2, 3]
aplanar([1, [2, [3, [4]]]])    # => [1, 2, 3, 4]
aplanar([])                    # => []
\`\`\`
`,
    difficulty: "intermediate",
    points: 20,
    moduleSlug: "arrays",
    order: 3,
    starterCode: `def aplanar(arr)
  # seu código aqui
end`,
    tests: `class TestAplanar < Minitest::Test
  def test_um_nivel
    assert_equal [1, 2, 3], aplanar([1, [2, 3]])
  end

  def test_multiplos_niveis
    assert_equal [1, 2, 3, 4], aplanar([1, [2, [3, [4]]]])
  end

  def test_vazio
    assert_equal [], aplanar([])
  end

  def test_ja_plano
    assert_equal [1, 2, 3], aplanar([1, 2, 3])
  end
end`,
  },

  // === MÓDULO 5: HASHES ===
  {
    title: "Frequência de Caracteres",
    description: `## Frequência de Caracteres

Escreva um método \`frequencia(str)\` que retorna um hash com a frequência de cada caractere na string.

### Exemplos

\`\`\`ruby
frequencia("aab")   # => { "a" => 2, "b" => 1 }
frequencia("ruby")  # => { "r" => 1, "u" => 1, "b" => 1, "y" => 1 }
frequencia("")      # => {}
\`\`\`
`,
    difficulty: "beginner",
    points: 15,
    moduleSlug: "hashes",
    order: 1,
    starterCode: `def frequencia(str)
  # seu código aqui
end`,
    tests: `class TestFrequencia < Minitest::Test
  def test_aab
    assert_equal({ "a" => 2, "b" => 1 }, frequencia("aab"))
  end

  def test_ruby
    resultado = frequencia("ruby")
    assert_equal 1, resultado["r"]
    assert_equal 1, resultado["u"]
    assert_equal 1, resultado["b"]
    assert_equal 1, resultado["y"]
  end

  def test_vazia
    assert_equal({}, frequencia(""))
  end
end`,
  },
  {
    title: "Mesclar Hashes",
    description: `## Mesclar Hashes

Escreva um método \`mesclar(h1, h2)\` que mescla dois hashes. Para chaves em comum, some os valores.

### Exemplos

\`\`\`ruby
mesclar({ a: 1, b: 2 }, { b: 3, c: 4 })
# => { a: 1, b: 5, c: 4 }

mesclar({ x: 10 }, { x: 5, y: 3 })
# => { x: 15, y: 3 }
\`\`\`
`,
    difficulty: "intermediate",
    points: 20,
    moduleSlug: "hashes",
    order: 2,
    starterCode: `def mesclar(h1, h2)
  # seu código aqui
end`,
    tests: `class TestMesclar < Minitest::Test
  def test_soma_valores_comuns
    resultado = mesclar({ a: 1, b: 2 }, { b: 3, c: 4 })
    assert_equal 1, resultado[:a]
    assert_equal 5, resultado[:b]
    assert_equal 4, resultado[:c]
  end

  def test_sem_sobreposicao
    resultado = mesclar({ a: 1 }, { b: 2 })
    assert_equal({ a: 1, b: 2 }, resultado)
  end

  def test_hashes_vazios
    assert_equal({ a: 1 }, mesclar({ a: 1 }, {}))
    assert_equal({ a: 1 }, mesclar({}, { a: 1 }))
  end
end`,
  },

  // === MÓDULO 6: CONTROLE DE FLUXO ===
  {
    title: "FizzBuzz",
    description: `## FizzBuzz

Escreva um método \`fizzbuzz(n)\` que retorna:
- \`"FizzBuzz"\` se n for divisível por 3 E por 5
- \`"Fizz"\` se n for divisível apenas por 3
- \`"Buzz"\` se n for divisível apenas por 5
- O número como string caso contrário

### Exemplos

\`\`\`ruby
fizzbuzz(15)  # => "FizzBuzz"
fizzbuzz(9)   # => "Fizz"
fizzbuzz(10)  # => "Buzz"
fizzbuzz(7)   # => "7"
\`\`\`
`,
    difficulty: "beginner",
    points: 10,
    moduleSlug: "controle-de-fluxo",
    order: 1,
    starterCode: `def fizzbuzz(n)
  # seu código aqui
end`,
    tests: `class TestFizzBuzz < Minitest::Test
  def test_fizzbuzz
    assert_equal "FizzBuzz", fizzbuzz(15)
    assert_equal "FizzBuzz", fizzbuzz(30)
  end

  def test_fizz
    assert_equal "Fizz", fizzbuzz(3)
    assert_equal "Fizz", fizzbuzz(9)
  end

  def test_buzz
    assert_equal "Buzz", fizzbuzz(5)
    assert_equal "Buzz", fizzbuzz(10)
  end

  def test_numero
    assert_equal "7", fizzbuzz(7)
    assert_equal "1", fizzbuzz(1)
  end
end`,
  },
  {
    title: "Classificador de Triângulos",
    description: `## Classificador de Triângulos

Escreva um método \`tipo_triangulo(a, b, c)\` que recebe os três lados de um triângulo e retorna:

- \`"equilátero"\` — todos os lados iguais
- \`"isósceles"\` — dois lados iguais
- \`"escaleno"\` — todos os lados diferentes
- \`"inválido"\` — não forma um triângulo

### Regra do triângulo

Um triângulo é válido se a soma de quaisquer dois lados é maior que o terceiro.

### Exemplos

\`\`\`ruby
tipo_triangulo(3, 3, 3)  # => "equilátero"
tipo_triangulo(3, 3, 4)  # => "isósceles"
tipo_triangulo(3, 4, 5)  # => "escaleno"
tipo_triangulo(1, 2, 10) # => "inválido"
\`\`\`
`,
    difficulty: "intermediate",
    points: 20,
    moduleSlug: "controle-de-fluxo",
    order: 2,
    starterCode: `def tipo_triangulo(a, b, c)
  # seu código aqui
end`,
    tests: `class TestTriangulo < Minitest::Test
  def test_equilatero
    assert_equal "equilátero", tipo_triangulo(3, 3, 3)
  end

  def test_isosceles
    assert_equal "isósceles", tipo_triangulo(3, 3, 4)
    assert_equal "isósceles", tipo_triangulo(5, 3, 5)
  end

  def test_escaleno
    assert_equal "escaleno", tipo_triangulo(3, 4, 5)
  end

  def test_invalido
    assert_equal "inválido", tipo_triangulo(1, 2, 10)
    assert_equal "inválido", tipo_triangulo(0, 0, 0)
  end
end`,
  },

  // === MÓDULO 7: LOOPS ===
  {
    title: "Sequência de Fibonacci",
    description: `## Sequência de Fibonacci

Escreva um método \`fibonacci(n)\` que retorna os primeiros \`n\` números da sequência de Fibonacci como um array.

A sequência começa com: 0, 1, 1, 2, 3, 5, 8, 13, ...

Cada número é a soma dos dois anteriores.

### Exemplos

\`\`\`ruby
fibonacci(1)   # => [0]
fibonacci(5)   # => [0, 1, 1, 2, 3]
fibonacci(8)   # => [0, 1, 1, 2, 3, 5, 8, 13]
\`\`\`
`,
    difficulty: "intermediate",
    points: 20,
    moduleSlug: "loops-iteradores",
    order: 1,
    starterCode: `def fibonacci(n)
  # seu código aqui
end`,
    tests: `class TestFibonacci < Minitest::Test
  def test_primeiro
    assert_equal [0], fibonacci(1)
  end

  def test_cinco
    assert_equal [0, 1, 1, 2, 3], fibonacci(5)
  end

  def test_oito
    assert_equal [0, 1, 1, 2, 3, 5, 8, 13], fibonacci(8)
  end

  def test_dois
    assert_equal [0, 1], fibonacci(2)
  end
end`,
  },
  {
    title: "Maior Número no Array",
    description: `## Maior Número no Array

Escreva um método \`maior(arr)\` que retorna o maior número de um array **sem usar o método \`max\`**.

Retorne \`nil\` para array vazio.

### Exemplos

\`\`\`ruby
maior([3, 1, 4, 1, 5, 9, 2, 6])  # => 9
maior([])                          # => nil
maior([-5, -1, -3])               # => -1
\`\`\`
`,
    difficulty: "beginner",
    points: 10,
    moduleSlug: "loops-iteradores",
    order: 2,
    starterCode: `def maior(arr)
  # seu código aqui (sem usar .max!)
end`,
    tests: `class TestMaior < Minitest::Test
  def test_positivos
    assert_equal 9, maior([3, 1, 4, 1, 5, 9, 2, 6])
  end

  def test_vazio
    assert_nil maior([])
  end

  def test_negativos
    assert_equal(-1, maior([-5, -1, -3]))
  end

  def test_unico
    assert_equal 42, maior([42])
  end
end`,
  },
  {
    title: "Número Primo",
    description: `## Número Primo

Escreva um método \`primo?(n)\` que retorna \`true\` se \`n\` for um número primo, e \`false\` caso contrário.

Um número primo é divisível apenas por 1 e por ele mesmo. Por convenção, 1 **não** é primo.

### Exemplos

\`\`\`ruby
primo?(2)   # => true
primo?(7)   # => true
primo?(9)   # => false (3 * 3)
primo?(1)   # => false
primo?(13)  # => true
\`\`\`
`,
    difficulty: "intermediate",
    points: 20,
    moduleSlug: "loops-iteradores",
    order: 3,
    starterCode: `def primo?(n)
  # seu código aqui
end`,
    tests: `class TestPrimo < Minitest::Test
  def test_dois
    assert primo?(2)
  end

  def test_sete
    assert primo?(7)
  end

  def test_treze
    assert primo?(13)
  end

  def test_nao_primo_nove
    refute primo?(9)
  end

  def test_um_nao_e_primo
    refute primo?(1)
  end

  def test_zero_nao_e_primo
    refute primo?(0)
  end
end`,
  },

  // === MÓDULO 8: MÉTODOS ===
  {
    title: "Fatorial",
    description: `## Fatorial

Escreva um método \`fatorial(n)\` que calcula o fatorial de um número inteiro não-negativo.

**n! = n × (n-1) × ... × 1**

Por definição, **0! = 1**.

### Exemplos

\`\`\`ruby
fatorial(0)   # => 1
fatorial(1)   # => 1
fatorial(5)   # => 120
fatorial(10)  # => 3628800
\`\`\`
`,
    difficulty: "beginner",
    points: 15,
    moduleSlug: "metodos",
    order: 1,
    starterCode: `def fatorial(n)
  # seu código aqui
end`,
    tests: `class TestFatorial < Minitest::Test
  def test_zero
    assert_equal 1, fatorial(0)
  end

  def test_um
    assert_equal 1, fatorial(1)
  end

  def test_cinco
    assert_equal 120, fatorial(5)
  end

  def test_dez
    assert_equal 3628800, fatorial(10)
  end
end`,
  },
  {
    title: "Anagramas",
    description: `## Anagramas

Escreva um método \`anagrama?(str1, str2)\` que retorna \`true\` se as duas strings são anagramas uma da outra (contêm os mesmos caracteres na mesma quantidade, independente de ordem ou capitalização).

### Exemplos

\`\`\`ruby
anagrama?("listen", "silent")  # => true
anagrama?("rail safety", "fairy tales")  # => true
anagrama?("ruby", "busy")      # => false
\`\`\`

> Ignore espaços na comparação.
`,
    difficulty: "intermediate",
    points: 20,
    moduleSlug: "metodos",
    order: 2,
    starterCode: `def anagrama?(str1, str2)
  # seu código aqui
end`,
    tests: `class TestAnagrama < Minitest::Test
  def test_listen_silent
    assert anagrama?("listen", "silent")
  end

  def test_fairy_tales
    assert anagrama?("rail safety", "fairy tales")
  end

  def test_nao_anagrama
    refute anagrama?("ruby", "busy")
  end

  def test_case_insensitive
    assert anagrama?("Listen", "Silent")
  end

  def test_mesmo_comprimento_diferente
    refute anagrama?("hello", "world")
  end
end`,
  },

  // === MÓDULO 9: BLOCOS, PROCS, LAMBDAS ===
  {
    title: "Meu Próprio map",
    description: `## Meu Próprio map

Implemente um método \`meu_map(arr)\` que funciona como o \`Array#map\` do Ruby, recebendo um array e um bloco, e retornando um novo array com o resultado do bloco aplicado a cada elemento.

**Não use o método \`map\` ou \`collect\` do Ruby.**

### Exemplos

\`\`\`ruby
meu_map([1, 2, 3]) { |n| n * 2 }    # => [2, 4, 6]
meu_map(["a", "b"]) { |c| c.upcase } # => ["A", "B"]
\`\`\`
`,
    difficulty: "intermediate",
    points: 20,
    moduleSlug: "blocos-procs-lambdas",
    order: 1,
    starterCode: `def meu_map(arr)
  # seu código aqui
  # use yield para chamar o bloco
end`,
    tests: `class TestMeuMap < Minitest::Test
  def test_dobrar
    assert_equal [2, 4, 6], meu_map([1, 2, 3]) { |n| n * 2 }
  end

  def test_upcase
    assert_equal ["A", "B", "C"], meu_map(["a", "b", "c"]) { |c| c.upcase }
  end

  def test_vazio
    assert_equal [], meu_map([]) { |n| n * 2 }
  end

  def test_quadrado
    assert_equal [1, 4, 9, 16], meu_map([1, 2, 3, 4]) { |n| n ** 2 }
  end
end`,
  },
  {
    title: "Memoização com Lambda",
    description: `## Memoização com Lambda

Escreva um método \`criar_memoizado(fn)\` que recebe um lambda/proc e retorna uma versão memoizada dele.

A versão memoizada deve armazenar em cache os resultados para evitar recalcular o mesmo input.

### Exemplos

\`\`\`ruby
fib = ->(n) { n < 2 ? n : fib.(n-1) + fib.(n-2) }
fib_memo = criar_memoizado(fib)

fib_memo.(10)  # => 55 (calculado)
fib_memo.(10)  # => 55 (do cache)
\`\`\`
`,
    difficulty: "advanced",
    points: 30,
    moduleSlug: "blocos-procs-lambdas",
    order: 2,
    starterCode: `def criar_memoizado(fn)
  # seu código aqui
  # retorne um lambda que usa cache
end`,
    tests: `class TestMemoizado < Minitest::Test
  def test_retorna_resultado_correto
    dobrar = ->(n) { n * 2 }
    memo = criar_memoizado(dobrar)
    assert_equal 10, memo.(5)
    assert_equal 20, memo.(10)
  end

  def test_usa_cache
    chamadas = 0
    fn = ->(n) { chamadas += 1; n * 2 }
    memo = criar_memoizado(fn)
    memo.(5)
    memo.(5)
    memo.(5)
    assert_equal 1, chamadas  # deve ter sido chamado apenas 1 vez
  end

  def test_cache_por_argumento
    chamadas = 0
    fn = ->(n) { chamadas += 1; n * 2 }
    memo = criar_memoizado(fn)
    memo.(5)
    memo.(10)
    memo.(5)
    assert_equal 2, chamadas  # 5 e 10 são argumentos distintos
  end
end`,
  },

  // === MÓDULO 10: CLASSES E OBJETOS ===
  {
    title: "Classe Pilha (Stack)",
    description: `## Classe Pilha (Stack)

Implemente uma classe \`Pilha\` que simula uma pilha LIFO (Last In, First Out) com os métodos:

- \`push(item)\` — adiciona um item ao topo
- \`pop\` — remove e retorna o item do topo (retorna \`nil\` se vazia)
- \`peek\` — retorna o item do topo sem remover (retorna \`nil\` se vazia)
- \`empty?\` — retorna \`true\` se a pilha estiver vazia
- \`size\` — retorna o número de itens

### Exemplo

\`\`\`ruby
p = Pilha.new
p.push(1)
p.push(2)
p.push(3)
p.pop    # => 3
p.peek   # => 2
p.size   # => 2
\`\`\`
`,
    difficulty: "intermediate",
    points: 25,
    moduleSlug: "classes-objetos",
    order: 1,
    starterCode: `class Pilha
  def initialize
    # seu código aqui
  end

  def push(item)
    # seu código aqui
  end

  def pop
    # seu código aqui
  end

  def peek
    # seu código aqui
  end

  def empty?
    # seu código aqui
  end

  def size
    # seu código aqui
  end
end`,
    tests: `class TestPilha < Minitest::Test
  def setup
    @pilha = Pilha.new
  end

  def test_inicia_vazia
    assert @pilha.empty?
    assert_equal 0, @pilha.size
  end

  def test_push_e_size
    @pilha.push(1)
    @pilha.push(2)
    assert_equal 2, @pilha.size
    refute @pilha.empty?
  end

  def test_pop_lifo
    @pilha.push(1)
    @pilha.push(2)
    @pilha.push(3)
    assert_equal 3, @pilha.pop
    assert_equal 2, @pilha.pop
    assert_equal 1, @pilha.pop
  end

  def test_pop_vazia
    assert_nil @pilha.pop
  end

  def test_peek
    @pilha.push(10)
    @pilha.push(20)
    assert_equal 20, @pilha.peek
    assert_equal 2, @pilha.size  # peek não remove
  end

  def test_peek_vazia
    assert_nil @pilha.peek
  end
end`,
  },
  {
    title: "Classe Conta Bancária",
    description: `## Classe Conta Bancária

Implemente uma classe \`ContaBancaria\` com:

- \`initialize(titular, saldo_inicial = 0)\` — cria a conta
- \`depositar(valor)\` — adiciona valor ao saldo (ignorar valores <= 0)
- \`sacar(valor)\` — remove valor do saldo; retorna \`false\` e não altera se saldo insuficiente ou valor inválido
- \`saldo\` — retorna o saldo atual
- \`titular\` — retorna o nome do titular
- \`extrato\` — retorna array com histórico de transações

Cada transação no extrato deve ser: \`{ tipo: "depósito"/"saque", valor: x }\`

### Exemplo

\`\`\`ruby
conta = ContaBancaria.new("Alice", 100)
conta.depositar(50)
conta.sacar(30)
conta.saldo         # => 120
conta.extrato.size  # => 2
\`\`\`
`,
    difficulty: "advanced",
    points: 30,
    moduleSlug: "classes-objetos",
    order: 2,
    starterCode: `class ContaBancaria
  def initialize(titular, saldo_inicial = 0)
    # seu código aqui
  end

  def depositar(valor)
    # seu código aqui
  end

  def sacar(valor)
    # seu código aqui
  end

  def saldo
    # seu código aqui
  end

  def titular
    # seu código aqui
  end

  def extrato
    # seu código aqui
  end
end`,
    tests: `class TestContaBancaria < Minitest::Test
  def setup
    @conta = ContaBancaria.new("Alice", 100)
  end

  def test_saldo_inicial
    assert_equal 100, @conta.saldo
  end

  def test_titular
    assert_equal "Alice", @conta.titular
  end

  def test_depositar
    @conta.depositar(50)
    assert_equal 150, @conta.saldo
  end

  def test_sacar
    resultado = @conta.sacar(30)
    assert_equal true, resultado
    assert_equal 70, @conta.saldo
  end

  def test_sacar_saldo_insuficiente
    resultado = @conta.sacar(500)
    assert_equal false, resultado
    assert_equal 100, @conta.saldo
  end

  def test_extrato
    @conta.depositar(50)
    @conta.sacar(20)
    assert_equal 2, @conta.extrato.size
    assert_equal "depósito", @conta.extrato.first[:tipo]
    assert_equal "saque", @conta.extrato.last[:tipo]
  end

  def test_deposito_invalido
    @conta.depositar(-10)
    assert_equal 100, @conta.saldo
  end
end`,
  },
  {
    title: "Herança: Formas Geométricas",
    description: `## Herança: Formas Geométricas

Implemente uma hierarquia de classes para formas geométricas:

**Classe base \`Forma\`:**
- \`nome\` — retorna o nome da forma
- \`area\` — deve ser implementada pelas subclasses (raise NotImplementedError se não for)
- \`perimetro\` — deve ser implementada pelas subclasses

**Subclasse \`Retangulo\`:**
- \`initialize(largura, altura)\`
- \`area\` → largura × altura
- \`perimetro\` → 2 × (largura + altura)
- \`nome\` → "Retângulo"

**Subclasse \`Circulo\`:**
- \`initialize(raio)\`
- \`area\` → π × raio²
- \`perimetro\` → 2 × π × raio
- \`nome\` → "Círculo"

Use \`Math::PI\` para π.
`,
    difficulty: "advanced",
    points: 30,
    moduleSlug: "classes-objetos",
    order: 3,
    starterCode: `class Forma
  def nome
    # seu código aqui
  end

  def area
    raise NotImplementedError, "Implemente area em #{self.class}"
  end

  def perimetro
    raise NotImplementedError, "Implemente perimetro em #{self.class}"
  end
end

class Retangulo < Forma
  def initialize(largura, altura)
    # seu código aqui
  end

  def nome
    "Retângulo"
  end

  def area
    # seu código aqui
  end

  def perimetro
    # seu código aqui
  end
end

class Circulo < Forma
  def initialize(raio)
    # seu código aqui
  end

  def nome
    "Círculo"
  end

  def area
    # seu código aqui
  end

  def perimetro
    # seu código aqui
  end
end`,
    tests: `class TestFormas < Minitest::Test
  def test_retangulo_nome
    r = Retangulo.new(5, 3)
    assert_equal "Retângulo", r.nome
  end

  def test_retangulo_area
    r = Retangulo.new(5, 3)
    assert_equal 15, r.area
  end

  def test_retangulo_perimetro
    r = Retangulo.new(5, 3)
    assert_equal 16, r.perimetro
  end

  def test_circulo_nome
    c = Circulo.new(5)
    assert_equal "Círculo", c.nome
  end

  def test_circulo_area
    c = Circulo.new(5)
    assert_in_delta 78.539, c.area, 0.01
  end

  def test_circulo_perimetro
    c = Circulo.new(5)
    assert_in_delta 31.415, c.perimetro, 0.01
  end

  def test_forma_base_raise
    f = Forma.new
    assert_raises(NotImplementedError) { f.area }
  end
end`,
  },
];

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // Clear existing data
  await prisma.submission.deleteMany();
  await prisma.session.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.module.deleteMany();

  console.log("🗑️  Dados anteriores removidos\n");

  // Create modules
  const createdModules: Record<string, string> = {};

  for (const mod of modules) {
    const created = await prisma.module.create({
      data: {
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        icon: mod.icon,
        order: mod.order,
        content: mod.content,
      },
    });
    createdModules[mod.slug] = created.id;
    console.log(`✅ Módulo criado: ${mod.title}`);
  }

  console.log(`\n📚 ${modules.length} módulos criados\n`);

  // Create challenges
  let challengeCount = 0;
  for (const challenge of challenges) {
    const moduleId = createdModules[challenge.moduleSlug];
    if (!moduleId) {
      console.warn(`⚠️  Módulo não encontrado: ${challenge.moduleSlug}`);
      continue;
    }

    await prisma.challenge.create({
      data: {
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        points: challenge.points,
        moduleId,
        order: challenge.order,
        starterCode: challenge.starterCode,
        tests: challenge.tests,
      },
    });

    challengeCount++;
    console.log(`  ⚔️  Desafio: ${challenge.title} (${challenge.difficulty})`);
  }

  console.log(`\n⚔️  ${challengeCount} desafios criados`);
  console.log("\n✨ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
