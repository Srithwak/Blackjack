#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <random>
#include <chrono>

class Card {
public:
    enum Suit { HEARTS, DIAMONDS, CLUBS, SPADES };
    enum Rank {
        ACE = 1, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN,
        JACK, QUEEN, KING
    };

    Card(Rank r, Suit s) : rank(r), suit(s) {}

    int getValue() const {
        switch (rank) {
        case JACK:
        case QUEEN:
        case KING:
            return 10;
        case ACE:
            return 11;
        default:
            return static_cast<int>(rank);
        }
    }

    std::string getRankString() const {
        switch (rank) {
        case ACE: return "Ace";
        case JACK: return "Jack";
        case QUEEN: return "Queen";
        case KING: return "King";
        default: return std::to_string(static_cast<int>(rank));
        }
    }

    std::string getSuitString() const {
        switch (suit) {
        case HEARTS: return "Hearts";
        case DIAMONDS: return "Diamonds";
        case CLUBS: return "Clubs";
        case SPADES: return "Spades";
        default: return "Unknown";
        }
    }

    std::string toString() const {
        return getRankString() + " of " + getSuitString();
    }

private:
    Rank rank;
    Suit suit;
};

class Deck {
public:
    Deck() {
        // Create a full deck of 52 cards
        for (int s = Card::HEARTS; s <= Card::SPADES; ++s) {
            for (int r = Card::ACE; r <= Card::KING; ++r) {
                cards.emplace_back(static_cast<Card::Rank>(r), static_cast<Card::Suit>(s));
            }
        }
        shuffle();
    }

    void shuffle() {
        // Use current time as seed for random generator
        unsigned seed = std::chrono::system_clock::now().time_since_epoch().count();
        std::shuffle(cards.begin(), cards.end(), std::default_random_engine(seed));
    }

    Card drawCard() {
        if (cards.empty()) {
            throw std::runtime_error("No cards left in the deck!");
        }
        Card drawnCard = cards.back();
        cards.pop_back();
        return drawnCard;
    }

private:
    std::vector<Card> cards;
};

class Player {
public:
    Player(const std::string& name) :
        playerName(name),
        score(0),
        isBust(false),
        hasStood(false) {}

    void addCard(const Card& card) {
        hand.push_back(card);
        updateScore();
    }

    void updateScore() {
        score = 0;
        int aceCount = 0;

        // Calculate initial score
        for (const auto& card : hand) {
            score += card.getValue();
            if (card.getValue() == 11) {
                aceCount++;
            }
        }

        // Adjust for aces if score is over 21
        while (score > 21 && aceCount > 0) {
            score -= 10;
            aceCount--;
        }

        // Check if bust
        isBust = (score > 21);
    }

    void displayHand(bool hideFirst = false) const {
        std::cout << playerName + "'s hand:" << std::endl;
        for (size_t i = 0; i < hand.size(); ++i) {
            if (i == 0 && hideFirst) {
                std::cout << "  [Hidden Card]" << std::endl;
            }
            else {
                std::cout << "  " << hand[i].toString() << std::endl;
            }
        }
        if (!hideFirst) {
            std::cout << "  Total: " << score << std::endl;
        }
    }

    std::string getName() const { return playerName; }
    int getScore() const { return score; }
    bool getBust() const { return isBust; }
    const std::vector<Card>& getHand() const { return hand; }

    void stand() { hasStood = true; }
    bool getStood() const { return hasStood; }

private:
    std::string playerName;
    std::vector<Card> hand;
    int score;
    bool isBust;
    bool hasStood;
};

class BlackjackGame {
public:
    BlackjackGame() : deck(), player1("Player 1"), player2("Player 2"), currentPlayer(0) {}

    void start() {
        player1.addCard(deck.drawCard());
        player2.addCard(deck.drawCard());
        player1.addCard(deck.drawCard());
        player2.addCard(deck.drawCard());

        // Game loop
        while (!isGameOver()) {
            playTurn();
        }

        // Determine winner
        determineWinner();
    }

private:
    void playTurn() {
        Player& current = (currentPlayer == 0) ? player1 : player2;

        // Display hands
        player1.displayHand(currentPlayer == 1);
        player2.displayHand(currentPlayer == 0);

        // Skip turn if player already stood or busted
        if (current.getStood() || current.getBust()) {
            currentPlayer = 1 - currentPlayer;
            return;
        }

        // Ask player if they want to hit or stand
        std::cout << current.getName() + ", do you want to hit or stand? (h/s): ";
        char choice;
        std::cin >> choice;

        if (choice == 'h' || choice == 'H') {
            // Hit: draw a card
            current.addCard(deck.drawCard());
            current.displayHand();

            // Check for bust
            if (current.getBust()) {
                std::cout << current.getName() + " busts!" << std::endl;
            }
        }
        else {
            // Stand
            current.stand();
            std::cout << current.getName() + " stands." << std::endl;
            currentPlayer = 1 - currentPlayer;
        }
    }

    bool isGameOver() {
        // Game is over if:
        // 1. Either player busts, or
        // 2. Both players have stood
        return player1.getBust() ||
            player2.getBust() ||
            (player1.getStood() && player2.getStood());
    }

    void determineWinner() {
        std::cout << "\nFinal Hands:" << std::endl;
        player1.displayHand();
        player2.displayHand();

        // Check bust conditions first
        if (player1.getBust() && player2.getBust()) {
            std::cout << "Both players bust! It's a tie." << std::endl;
            return;
        }
        if (player1.getBust()) {
            std::cout << "Player 1 busts! Player 2 wins!" << std::endl;
            return;
        }
        if (player2.getBust()) {
            std::cout << "Player 2 busts! Player 1 wins!" << std::endl;
            return;
        }

        // Compare scores
        if (player1.getScore() > player2.getScore()) {
            std::cout << "Player 1 wins with " << player1.getScore()
                << " points!" << std::endl;
        }
        else if (player2.getScore() > player1.getScore()) {
            std::cout << "Player 2 wins with " << player2.getScore()
                << " points!" << std::endl;
        }
        else {
            std::cout << "It's a tie!" << std::endl;
        }
    }

    Deck deck;
    Player player1;
    Player player2;
    int currentPlayer;
};

int main() {
    std::cout << "Welcome to Two-Player Blackjack!" << std::endl;

    try {
        BlackjackGame game;
        game.start();
    }
    catch (const std::exception& e) {
        std::cerr << "An error occurred: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}