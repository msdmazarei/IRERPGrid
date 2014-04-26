using Irony.Parsing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IRERP.Web.Controls

{
    public class IRERPGridColCriteriaGrammar : Grammar
    {
        public IRERPGridColCriteriaGrammar()
        {
            var expression = new NonTerminal("expression");
            var term = new NonTerminal("term");
            var Id = new NonTerminal("Id");
            var Id_simple = TerminalFactory.CreateSqlExtIdentifier(this, "id_simple"); //covers normal identifiers (abc) and quoted id's ([abc d], "abc d")
            Id.Rule = Id_simple;
            var string_literal = new StringLiteral("string", "'", StringOptions.AllowsDoubledQuote);
            var number = new NumberLiteral("number");
            var tuple = new NonTerminal("tuple");

            var comma = ToTerm(",");


            var CalcUOp = new NonTerminal("CalcUOp");
            CalcUOp.Rule = ToTerm("-") | "+" | "not";
            var UniCalcExpr = new NonTerminal("UniCalcExpr");
            UniCalcExpr.Rule = CalcUOp + term;

            var CalcBinOp = new NonTerminal("CalcOp");
            CalcBinOp.Rule = ToTerm("+") | "-" | "%" | "*" | "/" | "^";

            term.Rule = Id | string_literal | number | tuple | UniCalcExpr;

            var CalcTerm = new NonTerminal("calcterm");
            CalcTerm.Rule = term | term + CalcBinOp + CalcTerm;
            tuple.Rule = "(" + CalcTerm + ")";


            var NOT = new NonTerminal("not");
            NOT.Rule = "NOT";

            var critOp = new NonTerminal("critOp");
            critOp.Rule = ToTerm(">") | "<" | "=" | "!=" | ">=" | "<=" | "like" | NOT + "like";
            var critSeed = new NonTerminal("critSeed");


            var critjoiners = new NonTerminal("critjoiners");
            critjoiners.Rule = ToTerm("and") | "or";
            var crit = new NonTerminal("crit");

            var critTuple = new NonTerminal("critTuple");
            critSeed.Rule = critOp + CalcTerm | critTuple;
            critTuple.Rule = "(" + crit + ")";

            crit.Rule = critSeed | critSeed + critjoiners + crit;

            //Operators
            RegisterOperators(10, "*", "/", "%");
            RegisterOperators(9, "+", "-");
            RegisterOperators(8, "=", ">", "<", ">=", "<=", "<>", "!=", "!<", "!>", "LIKE", "IN");
            RegisterOperators(7, "^", "&", "|");
            RegisterOperators(6, NOT);
            RegisterOperators(5, "AND");
            RegisterOperators(4, "OR");

            MarkPunctuation(",", "(", ")");



            this.Root = crit;
        }
    }
}
