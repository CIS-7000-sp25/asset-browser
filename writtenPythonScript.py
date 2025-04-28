
import hou
import os

def process_hip_file(input_file, output_file, modifications_func):
    """
    Open a Houdini file, apply modifications, and save it as a new file.
    
    Args:
        input_file (str): Path to the input .hip file
        output_file (str): Path where the modified file will be saved
        modifications_func (callable): Function that will perform modifications
    """
    # Check if input file exists
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file not found: {input_file}")
    
    # Make sure output directory exists
    output_dir = os.path.dirname(output_file)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Load the hip file
    hou.hipFile.load(input_file)
    
    # Apply the modifications
    modifications_func()
    
    # Save the modified file
    hou.hipFile.save(output_file)
    print(f"File saved: {output_file}")

def change_controller():
    
    # Get the node
    node_path = "/obj/STAGE/CONTROLLER"
    node = hou.node(node_path)
    if node is None:
        raise ValueError(f"Node not found: {node_path}")
    
    # Check if the parameter exists
    parameter_name = "assetName"
    param = node.parm(parameter_name)
    if param is None:
        raise ValueError(f"Parameter '{parameter_name}' not found on node {node_path}")
    
    # Set the new value
    param.set("bookStack")

    checked_out = " & pyCheckedOut & "

    parm_group = node.parmTemplateGroup()
    bool_parm = hou.ToggleParmTemplate("checked_out", "Checked Out", default_value=checked_out)

    # Add the parameter to the node
    parm_group.append(bool_parm)
    node.setParmTemplateGroup(parm_group)
    

# Example usage
if __name__ == "__main__":
    
    process_hip_file(r"C:/users/0cfer/Downloads/houdini_usd_template_v03.hipnc", r"C:\Users\0cfer\Downloads\generated_scene.hip", change_controller)
