namespace IndustrialAPS.Domain.Algorithms.Graph
{
    /*
     * Classe que concentra os principais algoritmos
     * utilizados sobre o Grafo da fábrica.
     *
     * Atualmente implementamos:
     *
     * - BFS      -> Busca em Largura
     * - DFS      -> Busca em Profundidade
     * - Dijkstra -> Menor caminho considerando pesos
     */
    public static class GraphAlgorithms
    {
        /*
         * =====================================================
         * BFS - BREADTH FIRST SEARCH / BUSCA EM LARGURA
         * =====================================================
         *
         * Percorre o grafo por níveis.
         *
         * Exemplo:
         *
         *        A
         *       / \
         *      B   C
         *      |
         *      D
         *
         * BFS a partir de A:
         *
         * A -> B -> C -> D
         *
         * No APS Industrial pode ser utilizado para descobrir
         * todas as máquinas alcançáveis a partir de uma máquina.
         */
        public static List<Vertex> BFS(
            Graph graph,
            Vertex start
        )
        {
            /*
             * HashSet impede visitar a mesma máquina
             * mais de uma vez.
             */
            var visited = new HashSet<Vertex>();

            /*
             * BFS utiliza uma fila.
             *
             * A primeira máquina adicionada
             * será também a primeira removida.
             */
            var queue = new Queue<Vertex>();

            /*
             * Guarda a ordem em que as máquinas
             * foram visitadas.
             */
            var result = new List<Vertex>();

            // Começamos pela máquina informada.
            queue.Enqueue(start);
            visited.Add(start);

            /*
             * Enquanto houver máquinas esperando
             * para serem processadas...
             */
            while (queue.Count > 0)
            {
                var current = queue.Dequeue();

                result.Add(current);

                /*
                 * Percorre todas as conexões
                 * que saem da máquina atual.
                 */
                foreach (var edge in current.Edges)
                {
                    /*
                     * Só adicionamos a máquina de destino
                     * se ela ainda não tiver sido visitada.
                     */
                    if (!visited.Contains(edge.Destination))
                    {
                        visited.Add(edge.Destination);

                        queue.Enqueue(edge.Destination);
                    }
                }
            }

            return result;
        }

        /*
         * =====================================================
         * DFS - DEPTH FIRST SEARCH / BUSCA EM PROFUNDIDADE
         * =====================================================
         *
         * Percorre o grafo seguindo um caminho até o final
         * antes de voltar para explorar outros caminhos.
         *
         * Exemplo:
         *
         *        A
         *       / \
         *      B   C
         *      |
         *      D
         *
         * Uma possível DFS:
         *
         * A -> B -> D -> C
         */
        public static List<Vertex> DFS(
            Graph graph,
            Vertex start
        )
        {
            /*
             * Guarda quais máquinas já foram visitadas.
             */
            var visited = new HashSet<Vertex>();

            /*
             * Guarda a ordem da busca.
             */
            var result = new List<Vertex>();

            /*
             * A implementação utiliza recursão.
             */
            DFSRecursive(
                start,
                visited,
                result
            );

            return result;
        }

        /*
         * Método auxiliar utilizado pela DFS.
         *
         * Ele visita uma máquina e continua avançando
         * pelas suas conexões até não haver outro
         * vértice não visitado.
         */
        private static void DFSRecursive(
            Vertex current,
            HashSet<Vertex> visited,
            List<Vertex> result
        )
        {
            // Marca a máquina atual como visitada.
            visited.Add(current);

            // Guarda a máquina na ordem do percurso.
            result.Add(current);

            /*
             * Analisa todas as conexões da máquina atual.
             */
            foreach (var edge in current.Edges)
            {
                /*
                 * Se ainda não visitamos o destino,
                 * continuamos a busca a partir dele.
                 */
                if (!visited.Contains(edge.Destination))
                {
                    DFSRecursive(
                        edge.Destination,
                        visited,
                        result
                    );
                }
            }
        }

        /*
         * =====================================================
         * DIJKSTRA - MENOR CAMINHO
         * =====================================================
         *
         * Procura o caminho de menor peso entre duas máquinas.
         *
         * Exemplo:
         *
         * A ----5----> B ----3----> C
         *
         * A ------------10--------> C
         *
         * Caminho escolhido:
         *
         * A -> B -> C
         *
         * Peso total:
         *
         * 5 + 3 = 8
         *
         * Em vez do caminho direto A -> C = 10.
         *
         * IMPORTANTE:
         * Dijkstra exige pesos não negativos.
         * Por isso já validamos Weight > 0
         * no cadastro das conexões.
         */
        public static (
            List<Vertex> Path,
            decimal TotalWeight
        ) Dijkstra(
            Graph graph,
            Vertex start,
            Vertex end
        )
        {
            /*
             * Guarda a menor distância conhecida
             * entre o início e cada máquina.
             */
            var distances =
                new Dictionary<Vertex, decimal>();

            /*
             * Guarda qual máquina veio imediatamente
             * antes de outra no menor caminho.
             *
             * Vertex? permite armazenar null corretamente,
             * eliminando o warning CS8625.
             */
            var previous =
                new Dictionary<Vertex, Vertex?>();

            /*
             * Conjunto de máquinas ainda
             * não processadas pelo algoritmo.
             */
            var unvisited =
                new HashSet<Vertex>(
                    graph.Vertices
                );

            /*
             * Inicialmente nenhuma distância é conhecida.
             *
             * Por isso todas começam como decimal.MaxValue.
             */
            foreach (var vertex in graph.Vertices)
            {
                distances[vertex] =
                    decimal.MaxValue;

                previous[vertex] = null;
            }

            /*
             * A distância da máquina inicial
             * para ela mesma é zero.
             */
            distances[start] = 0;

            while (unvisited.Count > 0)
            {
                /*
                 * Seleciona a máquina não visitada
                 * que possui a menor distância conhecida.
                 */
                var current = unvisited
                    .OrderBy(vertex =>
                        distances[vertex]
                    )
                    .First();

                /*
                 * Se a menor distância disponível ainda
                 * for infinito, as máquinas restantes
                 * são inalcançáveis a partir da origem.
                 *
                 * Essa verificação também evita
                 * overflow ao somar decimal.MaxValue.
                 */
                if (
                    distances[current] ==
                    decimal.MaxValue
                )
                {
                    break;
                }

                /*
                 * Se chegamos ao destino,
                 * não precisamos continuar procurando.
                 */
                if (current == end)
                {
                    break;
                }

                /*
                 * Marca a máquina atual como processada.
                 */
                unvisited.Remove(current);

                /*
                 * Analisa todas as conexões
                 * que saem da máquina atual.
                 */
                foreach (var edge in current.Edges)
                {
                    /*
                     * Se o destino já foi completamente
                     * processado, ignoramos essa aresta.
                     */
                    if (
                        !unvisited.Contains(
                            edge.Destination
                        )
                    )
                    {
                        continue;
                    }

                    /*
                     * Calcula o custo para chegar
                     * ao destino passando pela máquina atual.
                     */
                    var newDistance =
                        distances[current] +
                        edge.Weight;

                    /*
                     * Se encontramos um caminho melhor,
                     * atualizamos distância e predecessor.
                     */
                    if (
                        newDistance <
                        distances[edge.Destination]
                    )
                    {
                        distances[
                            edge.Destination
                        ] = newDistance;

                        previous[
                            edge.Destination
                        ] = current;
                    }
                }
            }

            /*
             * Se o destino permaneceu com distância infinita,
             * significa que não existe caminho entre
             * origem e destino.
             */
            if (
                distances[end] ==
                decimal.MaxValue
            )
            {
                return (
                    new List<Vertex>(),
                    -1
                );
            }

            /*
             * =================================================
             * RECONSTRUÇÃO DO CAMINHO
             * =================================================
             *
             * Começamos no destino e seguimos
             * os predecessores até chegar à origem.
             */
            var path = new List<Vertex>();

            Vertex? currentVertex = end;

            while (currentVertex != null)
            {
                /*
                 * Inserimos na posição zero porque
                 * estamos reconstruindo de trás para frente.
                 */
                path.Insert(
                    0,
                    currentVertex
                );

                currentVertex =
                    previous[currentVertex];
            }

            /*
             * Segurança adicional:
             *
             * o primeiro elemento precisa ser
             * exatamente a máquina de origem.
             */
            if (
                path.Count == 0 ||
                path[0] != start
            )
            {
                return (
                    new List<Vertex>(),
                    -1
                );
            }

            /*
             * Retorna:
             *
             * - caminho encontrado;
             * - peso total do caminho.
             */
            return (
                path,
                distances[end]
            );
        }
    }
}