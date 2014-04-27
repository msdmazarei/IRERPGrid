using Irony.Parsing;
using MsdLib.CSharp.BLLCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IRERP.Web.Controls
{
    public class ClientColumnCriteria
    {
        public string ColumnName { get; set; }
        public string Condition { get; set; }
        public MsdLib.CSharp.BLLCore.MsdCriteria GetMsdCrit()
        {
            MsdLib.CSharp.BLLCore.MsdCriteria rtn = new MsdLib.CSharp.BLLCore.MsdCriteria();
            Irony.Parsing.ParseTree pt = IRERP.Web.Controls.General.getGrammarTree(new IRERP.Web.Controls.IRERPGridColCriteriaGrammar(), Condition);
            
            if (pt != null)
            {
                ParseTreeNode node = pt.Root;
                if (node.Term.Name == "crit")
                    rtn = getByCritTerm(node);
                if (node.Term.Name == "critSeed")
                    rtn = getByCritSeed(node);
                    
            }
            else
                rtn = null;
            return rtn;
        }
        MsdCriteria getByCritTerm(ParseTreeNode node)
        {
            MsdCriteria rtn = new MsdCriteria();
            switch (node.ChildNodes.Count)
            {
                case 3:
                    //critseed join crit
                    var critseed = node.ChildNodes[0];
                    var op = node.ChildNodes[1];
                    var crit = node.ChildNodes[2];
                    MsdCriteria seed1 = getByCritSeed(critseed);
                    MsdCriteria crit1 = getByCritTerm(crit);
                    rtn = Join2Crits(op, seed1, crit1);
                    break;
                case 1:
                    switch (node.ChildNodes[0].Term.Name)
                    {
                        case "critSeed":
                            rtn = getByCritSeed(node.ChildNodes[0]);
                            break;
                        case "crit":
                            rtn = getByCritTerm(node.ChildNodes[0]);
                            break;
                        case"critTuple":
                            switch (node.ChildNodes[0].ChildNodes[0].Term.Name)
                            {
                                case "critSeed":
                                    rtn = getByCritSeed(node.ChildNodes[0].ChildNodes[0]);
                                    break;
                                case "crit":
                                    rtn = getByCritTerm(node.ChildNodes[0].ChildNodes[0]);
                                    break;
                            }
                            break;
                    }
               

                    break;


            }
            

            return rtn;
        }
        MsdCriteria getByCritSeed(ParseTreeNode node)
        {
            MsdCriteria rtn = new MsdCriteria();
            ParseTreeNode op = null;
            switch (node.ChildNodes.Count)
            {
                case 2: 
                    //Op and Term
                    op = node.ChildNodes[0];
                    var term = node.ChildNodes[1];
                    rtn = getByOpAndTerm(op, term);
                    break;
                case 3: 
                    //critseed op crit
                    var critseed = node.ChildNodes[0];
                    op = node.ChildNodes[1];
                    var crit = node.ChildNodes[2];
                    MsdCriteria seed1 = getByCritSeed(critseed);
                    MsdCriteria crit1 = getByCritTerm(crit);
                   rtn  =  Join2Crits(op, seed1, crit1);
                    break;
                case 1:
                    //critTuple
                    if (node.ChildNodes[0].Term.Name == "critTuple")
                    {
                        switch (node.ChildNodes[0].ChildNodes[0].Term.Name)
                        {
                            case "critSeed":
                                rtn =  getByCritSeed(node.ChildNodes[0].ChildNodes[0]);
                                break;
                            case "crit":
                                rtn = getByCritTerm(node.ChildNodes[0].ChildNodes[0]);
                                break;
                        }
                    }

                    break;
            }
            return rtn;
        }
        MsdCriteria Join2Crits(ParseTreeNode Op, MsdCriteria crit1, MsdCriteria crit2)
        {
            MsdCriteria rtn = new MsdCriteria();
            rtn.criteria = new MsdCriteria[] { crit1, crit2 };
            switch (Op.ChildNodes[0].Term.Name)
            {

                case "or":
                    rtn.Operator = MsdCriteriaOperator.or;
                    break;
                case "and":
                    rtn.Operator = MsdCriteriaOperator.and;
                    break;
            }
            
            return rtn;
        }
        MsdCriteria getByOpAndTerm(ParseTreeNode Op,ParseTreeNode node)
        {
            MsdCriteria rtn = new MsdCriteria();
            rtn.fieldName = ColumnName;
            switch (Op.ChildNodes[0].Term.Name)
            {
                case ">":
                    rtn.Operator = MsdCriteriaOperator.greaterThan;
                    break;
                case ">=":
                    rtn.Operator = MsdCriteriaOperator.greaterThanOrEqual;
                    break;
                case "<":
                    rtn.Operator = MsdCriteriaOperator.lessThan;
                    break;
                case "<=":
                    rtn.Operator = MsdCriteriaOperator.lessThanOrEqual;
                    break;
                case "=":
                    rtn.Operator = MsdCriteriaOperator.equals;
                    break;
                case "like":
                    rtn.Operator = MsdCriteriaOperator.contains;
                    break;
                case "!=":
                    rtn.Operator = MsdCriteriaOperator.notEqual;
                    break;
                case "not like":
                    rtn.Operator = MsdCriteriaOperator.notContains;
                    break;
                case "or":
                    rtn.Operator = MsdCriteriaOperator.or;
                    break;
                case "and":
                    rtn.Operator = MsdCriteriaOperator.and;
                    break;
            }

            rtn.value = getTerm(node) ;
            return rtn;
        }
        dynamic getTerm(ParseTreeNode node)
        {
            dynamic rtn = null;
            switch (node.Term.Name)
            {
                case "Id":
                    if (node.ChildNodes.Count > 0)
                        rtn = getId(node.ChildNodes[0]);
                    else
                        rtn = getId(node);
                    break;
                case "string":
                    if (node.ChildNodes.Count > 0)
                        rtn = getString(node.ChildNodes[0]);
                    else
                        rtn = getString(node);
                    break;
                case "number":
                    if (node.ChildNodes.Count > 0)
                        rtn = getNumber(node.ChildNodes[0]);
                    else
                        rtn = getNumber(node);
                    break;
                case "tuple":
                    if (node.ChildNodes.Count > 0)
                        rtn = getTuple(node.ChildNodes[0]);
                    else
                        rtn = getTuple(node);
                    break;
                case "UniCalcExpr":
                    break;
                case "calcterm":
                    rtn = CalcTerm(node);
                    break;
                case "term":
                    rtn =  getTerm(node.ChildNodes[0]);
                    break;

                default:
                    throw new Exception("Error Happen no find " + node.Term.Name);
            }
            return rtn;
        }
        dynamic getId(ParseTreeNode node)
        {
            dynamic rtn = null;
            switch (node.Term.Name)
            {
                case "id_simple":
                    rtn = node.Token.Text;
                    break;
                case "Id":
                    rtn = getId(node.ChildNodes[0]);

                    break;
            }
            return rtn;
        }
        dynamic getString(ParseTreeNode node)
        {
            dynamic rtn = null;
            switch (node.Term.Name)
            {
                case "string":
                    rtn = node.Token.Text;
                    break;
            }
            return rtn;
        }
        dynamic getNumber(ParseTreeNode node)
        {
            dynamic rtn = null;
            switch (node.Term.Name)
            {
                case "number":
                    return node.Token.Text;
                    break;
            }


            return rtn;
        }
        dynamic CalcTerm(ParseTreeNode node)
        {
            dynamic rtn = null;
            switch (node.ChildNodes.Count)
            {
                case 1:
                    switch (node.ChildNodes[0].Term.Name)
                    {
                        case "term":
                            rtn = getTerm(node.ChildNodes[0]);
                            break;
                        default:
                            throw new Exception("Error, can not identify :"+node.ChildNodes[0].Term.Name);

                    }
                    break;
                case 3:
                    var term = node.ChildNodes[0];
                    var termv = getTerm(term);
                    var CalcBinOp = node.ChildNodes[1];
                    var CalcTerm = node.ChildNodes[2];
                    var calctermv = getTerm(CalcTerm);
                    switch (CalcBinOp.ChildNodes[0].Term.Name)
                    {
                        case "+":
                            rtn = "(" +"("+termv+")" + "+" +"("+ calctermv+")" + ")";
                            break;
                        case "-":
                            rtn = "(" + "(" + termv + ")" + "-" + "(" + calctermv + ")" + ")";
                            break;
                        case "*":
                            rtn = "(" + "(" + termv + ")" + "*" + "(" + calctermv + ")" + ")";
                            break;
                        case "/":
                            rtn = "(" + "(" + termv + ")" + "/" + "(" + calctermv + ")" + ")";
                            break;
                        case "%":
                            rtn = "(" + "(" + termv + ")" + "%" + "(" + calctermv + ")" + ")";
                            break;
                        case "^":
                            rtn = "(" + "(" + termv + ")" + "^" + "(" + calctermv + ")" + ")";
                            break;
                    }
                    break;
            }
            return rtn;
        }
        dynamic getTuple(ParseTreeNode node)
        {
            dynamic rtn = null;
            switch(node.Term.Name)
            {
                case "tuple":
                    rtn = getTuple(node.ChildNodes[0]);
                    break;
                case "calcterm":
                    rtn = CalcTerm(node);
                    break;
            }
                
            return rtn;
        }
    }
}
