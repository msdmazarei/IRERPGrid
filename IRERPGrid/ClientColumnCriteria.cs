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
                                    rtn=getByCritSeed(node.ChildNodes[0].ChildNodes[0]);
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
                case ">":
                    rtn.Operator = MsdCriteriaOperator.greaterThan;

                    break;
                case "<":
                    rtn.Operator = MsdCriteriaOperator.lessThan;
                    break;
                case "=":
                    rtn.Operator = MsdCriteriaOperator.equals;
                    break;
                default:
                    rtn.Operator = MsdCriteriaOperator.contains;
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
                case "<":
                    rtn.Operator = MsdCriteriaOperator.lessThan;
                    break;
                case "=":
                    rtn.Operator = MsdCriteriaOperator.equals;
                    break;
                default:
                    rtn.Operator = MsdCriteriaOperator.contains;
                    break;
            }
            rtn.value = node.ChildNodes[0].ToString();
            return rtn;
        }

    }
}
