# Auditoria de campos — Base de Dados de Alvenaria Portuguesa

Fonte: Zenodo v2, 17 de abril de 2026, DOI 10.5281/zenodo.19633664. Ficheiro original: `data/MasonryPT_Dataset_v2.csv`, MD5 `c3e6ad528a71b7c26114d100fff03858`.

## Âmbito e limites

Foram verificadas as 469 entradas e os 31 campos por entrada: estrutura, preservação dos valores, vocabulário TA1–TA11, valores em falta, identificadores repetidos, cópias integralmente iguais, coordenadas e formato de campos numéricos. Esta é uma auditoria de consistência do ficheiro; não substitui a confrontação dos resultados com cada publicação ou relatório experimental. Nenhum valor científico foi corrigido ou imputado. Valores com intervalos, percentagens ou incertezas foram conservados sem os converter em médias.

## Exclusões do explorador: 9 entradas; permanecem 460

- 5 entradas classificadas como `Bloco Tijolo` e 1 como `Pedra Granito` foram excluídas da seleção apresentada: não contêm um código da classificação de tipologias TA1–TA11. Isto não significa que os respetivos ensaios sejam cientificamente inválidos. A fonte mistura aqui descrições de materiais com códigos tipológicos. A eventual classificação TA ou inclusão numa coleção de ensaios de materiais exige revisão do responsável pelos dados; não foi inferida.
- 2 cópias repetidas de `Por_TA5-Gra-CD_7E` foram excluídas por coincidirem integralmente nos 31 campos com a primeira ocorrência. Conservou-se a linha 201 do CSV; excluíram-se as linhas 202 e 203. É deduplicação documental, não eliminação de resultados distintos. Caso as linhas correspondam a provetes independentes com valores coincidentes, devem receber identificadores próprios e ser reintegradas.

O ficheiro `data/removed-records.csv` conserva cada entrada excluída, todos os seus valores originais, a linha do CSV e o motivo. A numeração inclui o cabeçalho na linha 1. `data/entry-audit.csv` regista a decisão e as observações para cada uma das 469 entradas.

- Linha 361, `Vil_-Gra-MP-D_FFFFFA770E`: módulo elástico estático `-3630 MPa`. A entrada foi retirada da seleção utilizável, pendente de confirmação da fonte: um valor negativo não é utilizável como parâmetro positivo de rigidez do material. Não foi aplicado valor absoluto, corrigido o sinal ou eliminado o registo original. A entrada também não tem tipologia indicada.

## Questões conservadas para confirmação

- 6 entradas sem tipologia: mantidas com a opção de filtro `Não indicado`; ausência não prova erro. Os códigos não foram deduzidos a partir do identificador ou do material.
- 9 grupos de identificadores repetidos na fonte: apenas as cópias integralmente iguais acima foram retiradas. Os restantes registos diferem em resultados, localizações, argamassas ou protocolos e foram conservados como entradas distintas.
- Linha 276, `Ave_TA10-Ado-CU_A8BC4`: espessura `0.2.`. Formato por confirmar, conservado literalmente; não se assumiu `0,2 m`.
- 40 entradas têm coordenadas em falta (`-`). São conservadas na tabela, omitidas do mapa e contabilizadas na indicação de cobertura cartográfica.
- `Location_City` mistura cidades, distritos e regiões. `Location_Parish` mistura freguesias e municípios. A interface usa rótulos genéricos de localização; não afirma corresponder a uma divisão administrativa uniforme.
- `Evora`, variantes de nomes de argamassas e entidades e resultados aparentemente extremos foram conservados. A correção ou fusão sem verificação das fontes poderia mudar o significado dos dados.
- Campos em branco e `-` são agrupados como `Não indicado` nos filtros, sem alteração dos valores nos detalhes e exportações.
- Espaços exteriores e a grafia de espaços em torno de `+` em `UnitType` são normalizados apenas para pesquisa e filtragem. Não foram fundidas argamassas por semelhança de nome.
- TA4 consta das 11 imagens de referência do site original, mas não tem entradas neste ficheiro. Está disponível como filtro e apresenta zero resultados.

## Preservação e reprodução

`records.json` conserva as 469 entradas originais. `published-records.json` contém exclusivamente a seleção de 460 entradas. `audit_dataset.py` reproduz a auditoria e os ficheiros derivados a partir do CSV original; verifica previamente o checksum e a igualdade de todos os campos com `records.json`. As exclusões são reversíveis e documentadas.

## Identidade visual

Logótipo principal oficial: pack Técnico ULisboa de janeiro de 2026. Azul `#009DE0`, cinzento `#46555F`, cinzento claro `#D2D3D4`; Source Sans 3, indicada como fonte oficial alternativa. O logótipo é utilizado como ficheiro oficial, sem redesenho ou alteração das proporções.

Manual e recursos: https://tecnico.ulisboa.pt/pt/sobre-o-tecnico/institucional/logo-e-manual-de-identidade/
Imagens TA1–TA11: copiadas do site original https://www.masonry.pt/ para preservar as referências visuais. Não foram atribuídas descrições técnicas adicionais às imagens.
