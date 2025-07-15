# Target Practice 3D

Este é um jogo de mira em 3D desenvolvido com Three.js, onde o objetivo é clicar em alvos que aparecem na tela para acumular pontos. O jogo oferece diferentes níveis de dificuldade e tipos de alvos, proporcionando uma experiência dinâmica e desafiadora.

## Funcionalidades Principais

*   **Múltiplos Níveis de Dificuldade:** Escolha entre Fácil, Médio e Difícil, cada um com configurações únicas de tempo de jogo, intervalo de aparição de alvos, velocidade e quantidade de obstáculos.
*   **Variedade de Alvos:** Encontre diferentes tipos de alvos, incluindo:
    *   **Alvos Normais (Vermelhos):** Concedem pontos positivos.
    *   **Alvos Dourados:** Concedem mais pontos.
    *   **Alvos Móveis (Verdes, Azuis, Roxos):** Apresentam padrões de movimento complexos (linear, circular, senoidal) e concedem pontos variados.
    *   **Alvos de Penalidade (Vermelho escuro):** Subtraem pontos e reduzem o tempo de jogo se clicados.
*   **Obstáculos 3D:** Objetos decorativos (caixas, cilindros, esferas, cones, torus) que, se clicados, resultam em perda de 1 ponto. A área de interação desses obstáculos foi ajustada para ser mais precisa.
*   **Sistema de Pontuação e Tempo:** Acompanhe sua pontuação, número de alvos acertados e tempo restante durante o jogo.
*   **Feedback Visual:** Efeitos visuais para indicar acertos, penalidades e fim de jogo.
*   **Botão "Sair para Lobby":** Permite retornar ao menu principal a qualquer momento durante o jogo.

## Animação e Gráficos

O jogo é renderizado em 3D usando a biblioteca Three.js, proporcionando uma experiência visual imersiva:

*   **Cenário Dinâmico:** Objetos decorativos 3D (obstáculos) são gerados aleatoriamente e espalhados pelo cenário.
*   **Animação de Alvos:** Alvos se movem e giram de forma fluida, com padrões de movimento variados que aumentam a dificuldade e o dinamismo do jogo.
*   **Efeitos Visuais:** Animações de fade-out para os efeitos de pontuação e penalidade, além de um efeito de tela vermelha para penalidades.

## Como Jogar

1.  **Selecione a Dificuldade:** No menu principal, escolha entre Fácil, Médio ou Difícil.
2.  **Inicie o Jogo:** Clique no botão "Iniciar Jogo".
3.  **Acerte os Alvos:** Clique nos alvos que aparecem na tela para ganhar pontos.
4.  **Evite os Obstáculos:** Não clique nos objetos decorativos para evitar perder pontos.
5.  **Gerencie o Tempo:** Fique atento ao tempo restante. Alvos de penalidade reduzem seu tempo de jogo.
6.  **Saia para o Lobby:** A qualquer momento, você pode clicar em "Sair para Lobby" para retornar ao menu principal.


